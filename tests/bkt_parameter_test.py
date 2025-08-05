#!/usr/bin/env python3
"""
BKT Parameter Analyzer for Japanese Learning App
Analyzes real MongoDB exports to discover BKT parameters for each grammar point and vocabulary item
"""

import json
import pandas as pd
from collections import defaultdict
import sys

try:
    from pyBKT.models import Model
except ImportError as e:
    print(f"❌ Missing pyBKT dependency: {e}")
    print("Install with: pip install pyBKT")
    sys.exit(1)

def load_mongodb_export(filename):
    """Load MongoDB export JSON file"""
    try:
        with open(filename, 'r') as f:
            data = json.load(f)
        print(f"✅ Loaded {len(data)} records from {filename}")
        return data
    except FileNotFoundError:
        print(f"❌ File not found: {filename}")
        return None
    except json.JSONDecodeError as e:
        print(f"❌ Invalid JSON in {filename}: {e}")
        return None

def group_by_item(data, item_type='grammar'):
    """Group progress records by grammar point or word"""
    grouped = defaultdict(list)
    
    if item_type == 'grammar':
        item_key = 'grammarPoint'
    elif item_type == 'word':
        item_key = 'word'
    else:
        raise ValueError(f"Unknown item_type: {item_type}")
    
    for record in data:
        if item_key in record:
            item_id = record[item_key]['$oid']
            grouped[item_id].append(record)
    
    print(f"📊 Found {len(grouped)} unique {item_type} items")
    for item_id, records in grouped.items():
        print(f"  {item_id[:8]}...: {len(records)} users")
    
    return grouped

def convert_to_pyBKT_format(records, item_id):
    """Convert MongoDB progress records to pyBKT DataFrame format"""
    responses = []
    
    for record in records:
        user_id = record['user']['$oid']
        success_count = record['successCount']
        failure_count = record['failureCount']
        
        # Create individual response records for pyBKT
        # Add successful attempts
        for i in range(success_count):
            responses.append({
                'user_id': user_id,
                'skill_name': item_id,
                'correct': 1,
                'order_id': i
            })
        
        # Add failed attempts
        for i in range(failure_count):
            responses.append({
                'user_id': user_id,
                'skill_name': item_id,
                'correct': 0,
                'order_id': success_count + i
            })
    
    if not responses:
        return None
    
    return pd.DataFrame(responses)

def extract_parameters_from_model(model, skill_name):
    """Extract BKT parameters from trained model"""
    try:
        params_df = model.params()
        
        # The params DataFrame has MultiIndex: (skill, parameter)
        skill_params = params_df.loc[skill_name]
        
        extracted = {
            'prior_knowledge': float(skill_params.loc['prior', 'value'].iloc[0]),
            'learning_rate': float(skill_params.loc['learns', 'value'].iloc[0]),
            'slip_rate': float(skill_params.loc['slips', 'value'].iloc[0]),
            'guess_rate': float(skill_params.loc['guesses', 'value'].iloc[0]),
            'forget_rate': float(skill_params.loc['forgets', 'value'].iloc[0])
        }
        
        return extracted
        
    except Exception as e:
        print(f"    ❌ Error extracting parameters: {e}")
        return None

def analyze_item_with_bkt(records, item_id, item_type='grammar', default_params=None):
    """Run BKT analysis on a single item (grammar point or word)"""
    
    # Convert to pyBKT format
    df = convert_to_pyBKT_format(records, item_id)
    if df is None or len(df) == 0:
        print(f"    ⚠️  No response data for {item_id[:8]}...")
        return None
    
    total_responses = len(df)
    total_users = df['user_id'].nunique()
    success_rate = df['correct'].mean()
    
    print(f"    📈 {total_responses} responses from {total_users} users, {success_rate:.1%} success rate")
    
    # Skip items with insufficient data
    if total_responses < 10 or total_users < 3:
        print(f"    ⚠️  Insufficient data (need ≥10 responses from ≥3 users)")
        return None
    
    try:
        # Create and fit BKT model
        model = Model(
            seed=42,
            num_fits=3,  # Multiple fits for robustness
            parallel=False
        )
        
        print(f"    🔄 Fitting BKT model...")
        model.fit(data=df)
        
        # Extract parameters
        discovered_params = extract_parameters_from_model(model, item_id)
        
        if discovered_params is None:
            return None
        
        # Compare with defaults if provided
        if default_params:
            print(f"    📊 Parameter Comparison:")
            print(f"    {'Parameter':<15} {'Default':<8} {'Discovered':<10} {'Change':<10}")
            print(f"    {'-' * 50}")
            
            for param_name in ['prior_knowledge', 'learning_rate', 'slip_rate', 'guess_rate']:
                default_val = default_params.get(param_name, 0)
                discovered_val = discovered_params[param_name]
                
                if default_val > 0:
                    change = ((discovered_val - default_val) / default_val * 100)
                    arrow = "↑" if change > 0 else "↓" if change < 0 else "→"
                    print(f"    {param_name:<15} {default_val:<8.3f} {discovered_val:<10.3f} {arrow}{abs(change):>6.1f}%")
                else:
                    print(f"    {param_name:<15} {'N/A':<8} {discovered_val:<10.3f} {'New':>9}")
        
        return {
            'item_id': item_id,
            'item_type': item_type,
            'total_responses': total_responses,
            'total_users': total_users,
            'success_rate': success_rate,
            'parameters': discovered_params
        }
        
    except Exception as e:
        print(f"    ❌ BKT analysis failed: {e}")
        return None

def analyze_all_items(data, item_type='grammar', default_params=None):
    """Analyze all grammar points or words"""
    
    print(f"\n🔍 Analyzing {item_type} items...")
    
    # Group records by item
    grouped_data = group_by_item(data, item_type)
    
    if not grouped_data:
        print(f"❌ No {item_type} data found")
        return []
    
    results = []
    
    for i, (item_id, records) in enumerate(grouped_data.items(), 1):
        print(f"\n  [{i}/{len(grouped_data)}] Analyzing {item_type} {item_id[:8]}...")
        
        result = analyze_item_with_bkt(records, item_id, item_type, default_params)
        if result:
            results.append(result)
    
    return results

def save_results(results, output_filename):
    """Save analysis results to JSON file"""
    
    # Prepare results for JSON serialization
    json_results = {
        'analysis_timestamp': pd.Timestamp.now().isoformat(),
        'total_items_analyzed': len(results),
        'items': []
    }
    
    for result in results:
        json_results['items'].append({
            'item_id': result['item_id'],
            'item_type': result['item_type'],
            'statistics': {
                'total_responses': result['total_responses'],
                'total_users': result['total_users'],
                'success_rate': result['success_rate']
            },
            'bkt_parameters': result['parameters']
        })
    
    with open(output_filename, 'w') as f:
        json.dump(json_results, f, indent=2)
    
    print(f"💾 Results saved to {output_filename}")

def print_summary(grammar_results, word_results):
    """Print analysis summary"""
    
    print(f"\n" + "=" * 60)
    print(f"📋 ANALYSIS SUMMARY")
    print(f"=" * 60)
    
    if grammar_results:
        print(f"\n🔤 Grammar Points Analyzed: {len(grammar_results)}")
        
        # Calculate averages
        avg_learning_rate = sum(r['parameters']['learning_rate'] for r in grammar_results) / len(grammar_results)
        avg_slip_rate = sum(r['parameters']['slip_rate'] for r in grammar_results) / len(grammar_results)
        avg_prior = sum(r['parameters']['prior_knowledge'] for r in grammar_results) / len(grammar_results)
        
        print(f"  Average Learning Rate: {avg_learning_rate:.3f}")
        print(f"  Average Slip Rate: {avg_slip_rate:.3f}")
        print(f"  Average Prior Knowledge: {avg_prior:.3f}")
    
    if word_results:
        print(f"\n📚 Words Analyzed: {len(word_results)}")
        
        # Calculate averages
        avg_learning_rate = sum(r['parameters']['learning_rate'] for r in word_results) / len(word_results)
        avg_slip_rate = sum(r['parameters']['slip_rate'] for r in word_results) / len(word_results)
        avg_prior = sum(r['parameters']['prior_knowledge'] for r in word_results) / len(word_results)
        
        print(f"  Average Learning Rate: {avg_learning_rate:.3f}")
        print(f"  Average Slip Rate: {avg_slip_rate:.3f}")
        print(f"  Average Prior Knowledge: {avg_prior:.3f}")
    
    print(f"\n💡 Next Steps:")
    print(f"  1. Review the generated JSON files for detailed parameters")
    print(f"  2. Update your app's default BKT parameters")
    
    print(f"\n💡 Next Steps:")
    print(f"  1. Review the generated JSON files for detailed parameters")
    print(f"  2. Update your app's default BKT parameters")
    print(f"  3. Consider implementing per-item parameter customization")

def main():
    """Main analysis function"""
    
    print("🚀 BKT Parameter Analysis for Japanese Learning App")
    print("=" * 60)
    
    # Default parameters (you can modify these)
    default_params = {
        'prior_knowledge': 0.06,
        'learning_rate': 0.35,
        'slip_rate': 0.18,
        'guess_rate': 0.25
    }
    
    print("📝 Current Default Parameters:")
    for key, value in default_params.items():
        print(f"   {key}: {value}")
    
    # Load data files
    print(f"\n📂 Loading data files...")
    
    grammar_data = load_mongodb_export('vocabularyApp.usergrammarpointprogressesFULL.json')
    word_data = load_mongodb_export('vocabularyApp.userwordprogressesFULL.json')
    
    # For testing with generated data, try these files:
    if grammar_data is None:
        print("📂 Trying test data files...")
        grammar_data = load_mongodb_export('test_usergrammarpointprogresses.json')
    
    if word_data is None:
        word_data = load_mongodb_export('test_userwordprogresses.json')
    
    if not grammar_data and not word_data:
        print("❌ No data files found. Please ensure you have:")
        print("   - vocabularyApp.usergrammarpointprogresses.json")
        print("   - vocabularyApp.userwordprogresses.json")
        print("   OR run generate_test_data.py first to create test data")
        return False
    
    results = {'grammar': [], 'word': []}
    
    # Analyze grammar points
    if grammar_data:
        results['grammar'] = analyze_all_items(grammar_data, 'grammar', default_params)
        if results['grammar']:
            save_results(results['grammar'], 'grammar_bkt_analysis.json')
    
    # Analyze words
    if word_data:
        results['word'] = analyze_all_items(word_data, 'word', default_params)
        if results['word']:
            save_results(results['word'], 'word_bkt_analysis.json')
    
    # Print summary
    print_summary(results['grammar'], results['word'])
    
    if results['grammar'] or results['word']:
        print(f"\n✨ Analysis completed successfully!")
        return True
    else:
        print(f"\n💥 Analysis failed - no items could be processed")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)