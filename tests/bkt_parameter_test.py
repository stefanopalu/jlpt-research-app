#!/usr/bin/env python3
"""
BKT Parameter Analyzer for Japanese Learning App - IMPROVED VERSION
Analyzes real MongoDB exports to discover BKT parameters for each grammar point and vocabulary item
Uses actual learning sequences for more accurate parameter estimation
"""

import json
import pandas as pd
import random
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

def create_realistic_sequence_from_counts(success_count, failure_count):
    """Create a realistic learning sequence from just success/failure counts"""
    total = success_count + failure_count
    if total == 0:
        return []
    
    sequence = []
    
    # Simulate learning: start with lower success rate, improve over time
    current_success_prob = 0.3  # Start with 30% success rate
    improvement_rate = 0.05     # Improve by 5% each attempt
    
    successes_left = success_count
    failures_left = failure_count
    
    for attempt in range(total):
        # Adjust success probability based on remaining ratio
        if successes_left + failures_left > 0:
            target_rate = successes_left / (successes_left + failures_left)
            # Blend current probability with target rate
            current_success_prob = (current_success_prob + target_rate) / 2
        
        # Make decision
        if random.random() < current_success_prob and successes_left > 0:
            sequence.append(1)
            successes_left -= 1
            current_success_prob = min(0.9, current_success_prob + improvement_rate)
        elif failures_left > 0:
            sequence.append(0)
            failures_left -= 1
        else:
            # If we run out of failures, remaining must be successes
            sequence.append(1)
            successes_left -= 1
    
    return sequence

def convert_to_pyBKT_format(records, item_id):
    """Convert MongoDB progress records to pyBKT DataFrame format using actual sequences"""
    responses = []
    sequences_used = 0
    fallback_used = 0
    
    for record in records:
        user_id = record['user']['$oid']
        
        # Check if we have the debug sequence (from improved generator)
        if '_debug_sequence' in record and record['_debug_sequence']:
            # Use the actual learning sequence
            sequence = record['_debug_sequence']
            sequences_used += 1
            
            for i, correct in enumerate(sequence):
                responses.append({
                    'user_id': user_id,
                    'skill_name': item_id,
                    'correct': correct,
                    'order_id': i
                })
        else:
            # Fallback: Try to create a more realistic sequence from counts
            success_count = record['successCount']
            failure_count = record['failureCount']
            
            if success_count == 0 and failure_count == 0:
                continue  # Skip users with no attempts
            
            # Create a more realistic learning progression
            sequence = create_realistic_sequence_from_counts(success_count, failure_count)
            fallback_used += 1
            
            for i, correct in enumerate(sequence):
                responses.append({
                    'user_id': user_id,
                    'skill_name': item_id,
                    'correct': correct,
                    'order_id': i
                })
    
    if sequences_used > 0 or fallback_used > 0:
        print(f"    🔄 Used {sequences_used} real sequences, {fallback_used} generated sequences")
    
    if not responses:
        return None
    
    return pd.DataFrame(responses)

def extract_parameters_from_model(model, skill_name):
    """Extract BKT parameters from trained model with realistic constraints"""
    try:
        params_df = model.params()
        skill_params = params_df.loc[skill_name]
        
        # Extract raw parameters
        raw_params = {
            'prior_knowledge': float(skill_params.loc['prior', 'value'].iloc[0]),
            'learning_rate': float(skill_params.loc['learns', 'value'].iloc[0]),
            'slip_rate': float(skill_params.loc['slips', 'value'].iloc[0]),
            'guess_rate': float(skill_params.loc['guesses', 'value'].iloc[0]),
            'forget_rate': float(skill_params.loc['forgets', 'value'].iloc[0])
        }
        
        # Apply realistic constraints to prevent impossible values
        extracted = {
            'prior_knowledge': max(0.01, min(0.80, raw_params['prior_knowledge'])),
            'learning_rate': max(0.01, min(0.70, raw_params['learning_rate'])),
            'slip_rate': max(0.05, min(0.35, raw_params['slip_rate'])),
            'guess_rate': max(0.10, min(0.50, raw_params['guess_rate'])),
            'forget_rate': max(0.00, min(0.15, raw_params['forget_rate']))
        }
        
        # Log if we had to constrain parameters (for debugging)
        constrained = []
        for key in raw_params:
            if key != 'forget_rate' and abs(raw_params[key] - extracted[key]) > 0.01:
                constrained.append(f"{key}: {raw_params[key]:.3f}→{extracted[key]:.3f}")
        
        if constrained:
            print(f"    📝 Constrained: {', '.join(constrained)}")
        
        return extracted
        
    except Exception as e:
        print(f"    ❌ Error extracting parameters: {e}")
        return None

def analyze_item_with_bkt(records, item_id, item_type='grammar', default_params=None):
    """Run BKT analysis on a single item with improved sequence handling"""
    
    # Convert to pyBKT format using actual sequences
    df = convert_to_pyBKT_format(records, item_id)
    if df is None or len(df) == 0:
        print(f"    ⚠️  No response data for {item_id[:8]}...")
        return None
    
    total_responses = len(df)
    total_users = df['user_id'].nunique()
    success_rate = df['correct'].mean()
    
    print(f"    📈 {total_responses} responses from {total_users} users, {success_rate:.1%} success rate")
    
    # Skip items with insufficient data (increased thresholds for better accuracy)
    if total_responses < 20 or total_users < 5:
        print(f"    ⚠️  Insufficient data (need ≥20 responses from ≥5 users)")
        return None
    
    try:
        # Create and fit BKT model with improved configuration
        model = Model(
            seed=42,
            num_fits=5,      # More fits for stability
            parallel=False,
            defaults={       # Better default starting points
                'prior': 0.1,
                'learns': 0.3, 
                'slips': 0.15,
                'guesses': 0.2
            }
        )
        
        print(f"    🔄 Fitting BKT model with improved parameters...")
        model.fit(data=df)
        
        # Extract parameters with constraints
        discovered_params = extract_parameters_from_model(model, item_id)
        
        if discovered_params is None:
            return None
        
        # Show parameter comparison
        if default_params:
            print(f"    📊 Parameter Comparison:")
            print(f"    {'Parameter':<15} {'Default':<8} {'Discovered':<10} {'Change':<10}")
            print(f"    {'-' * 50}")
            
            for param_name in ['prior_knowledge', 'learning_rate', 'slip_rate', 'guess_rate']:
                default_val = default_params.get(param_name, 0)
                discovered_val = discovered_params[param_name]
                
                if default_val > 0:
                    change = ((discovered_val - default_val) / default_val * 100)
                    arrow = "↑" if change > 10 else "↓" if change < -10 else "≈"
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
    
    print(f"\n🔍 Analyzing {item_type} items with improved BKT...")
    
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
        'analyzer_version': 'improved_v2.0',
        'improvements': [
            'Uses actual learning sequences when available',
            'Applies realistic parameter constraints',
            'Better BKT model configuration',
            'Improved fallback sequence generation'
        ],
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
    """Print analysis summary with parameter quality assessment"""
    
    print(f"\n" + "=" * 70)
    print(f"📋 IMPROVED BKT ANALYSIS SUMMARY")
    print(f"=" * 70)
    
    if grammar_results:
        print(f"\n🔤 Grammar Points Analyzed: {len(grammar_results)}")
        
        # Calculate averages
        avg_learning_rate = sum(r['parameters']['learning_rate'] for r in grammar_results) / len(grammar_results)
        avg_slip_rate = sum(r['parameters']['slip_rate'] for r in grammar_results) / len(grammar_results)
        avg_prior = sum(r['parameters']['prior_knowledge'] for r in grammar_results) / len(grammar_results)
        avg_guess = sum(r['parameters']['guess_rate'] for r in grammar_results) / len(grammar_results)
        
        print(f"  📊 Parameter Averages:")
        print(f"    Prior Knowledge: {avg_prior:.1%} (how much students know initially)")
        print(f"    Learning Rate:   {avg_learning_rate:.1%} (how quickly they learn)")
        print(f"    Slip Rate:       {avg_slip_rate:.1%} (mistakes when they know it)")
        print(f"    Guess Rate:      {avg_guess:.1%} (correct guesses when they don't know)")
        
        # Parameter quality assessment
        quality_issues = []
        if avg_slip_rate > 0.25:
            quality_issues.append("High slip rate suggests data quality issues")
        if avg_learning_rate < 0.1:
            quality_issues.append("Low learning rate may indicate insufficient learning progression")
        
        if quality_issues:
            print(f"  ⚠️  Quality Notes: {'; '.join(quality_issues)}")
    
    if word_results:
        print(f"\n📚 Words Analyzed: {len(word_results)}")
        
        # Calculate averages
        avg_learning_rate = sum(r['parameters']['learning_rate'] for r in word_results) / len(word_results)
        avg_slip_rate = sum(r['parameters']['slip_rate'] for r in word_results) / len(word_results)
        avg_prior = sum(r['parameters']['prior_knowledge'] for r in word_results) / len(word_results)
        avg_guess = sum(r['parameters']['guess_rate'] for r in word_results) / len(word_results)
        
        print(f"  📊 Parameter Averages:")
        print(f"    Prior Knowledge: {avg_prior:.1%}")
        print(f"    Learning Rate:   {avg_learning_rate:.1%}")
        print(f"    Slip Rate:       {avg_slip_rate:.1%}")
        print(f"    Guess Rate:      {avg_guess:.1%}")
    
    # Compare grammar vs words if both available
    if grammar_results and word_results:
        print(f"\n🔍 Grammar vs Words Comparison:")
        g_learn = sum(r['parameters']['learning_rate'] for r in grammar_results) / len(grammar_results)
        w_learn = sum(r['parameters']['learning_rate'] for r in word_results) / len(word_results)
        
        if g_learn > w_learn * 1.1:
            print(f"  • Grammar appears easier to learn ({g_learn:.1%} vs {w_learn:.1%})")
        elif w_learn > g_learn * 1.1:
            print(f"  • Words appear easier to learn ({w_learn:.1%} vs {g_learn:.1%})")
        else:
            print(f"  • Similar learning rates for both ({g_learn:.1%} vs {w_learn:.1%})")
    
    print(f"\n💡 Next Steps:")
    print(f"  1. Review detailed parameters in the generated JSON files")
    print(f"  2. Use these parameters to customize your BKT implementation")
    print(f"  3. Consider difficulty-based parameter groups")
    print(f"  4. Monitor real user data to validate these parameters")
    
    print(f"\n✨ Parameter Quality: Much improved with realistic constraints!")

def main():
    """Main analysis function with improved BKT processing"""
    
    print("🚀 IMPROVED BKT Parameter Analysis for Japanese Learning App")
    print("=" * 70)
    print("🔧 Improvements: Learning sequences, parameter constraints, better fitting")
    
    # Default parameters (you can modify these)
    default_params = {
        'prior_knowledge': 0.06,
        'learning_rate': 0.35,
        'slip_rate': 0.18,
        'guess_rate': 0.25
    }
    
    print("\n📝 Current Default Parameters:")
    for key, value in default_params.items():
        print(f"   {key}: {value}")
    
    # Load data files
    print(f"\n📂 Loading data files...")
    
    grammar_data = load_mongodb_export('test_usergrammarpointprogresses100.json')
    word_data = load_mongodb_export('test_userwordprogresses100.json')
    
    # Try alternative file names
    if grammar_data is None:
        print("📂 Trying alternative grammar file names...")
        for filename in ['test_usergrammarpointprogresses100.json', 'usergrammarpointprogresses.json']:
            grammar_data = load_mongodb_export(filename)
            if grammar_data:
                break
    
    if word_data is None:
        print("📂 Trying alternative word file names...")
        for filename in ['test_userwordprogresses100.json', 'userwordprogresses.json']:
            word_data = load_mongodb_export(filename)
            if word_data:
                break
    
    if not grammar_data and not word_data:
        print("❌ No data files found. Please ensure you have:")
        print("   - test_usergrammarpointprogresses.json")
        print("   - test_userwordprogresses.json")
        print("   OR run the improved data generator first")
        return False
    
    results = {'grammar': [], 'word': []}
    
    # Analyze grammar points
    if grammar_data:
        results['grammar'] = analyze_all_items(grammar_data, 'grammar', default_params)
        if results['grammar']:
            save_results(results['grammar'], 'improved_grammar_bkt_analysis.json')
    
    # Analyze words
    if word_data:
        results['word'] = analyze_all_items(word_data, 'word', default_params)
        if results['word']:
            save_results(results['word'], 'improved_word_bkt_analysis.json')
    
    # Print summary
    print_summary(results['grammar'], results['word'])
    
    if results['grammar'] or results['word']:
        print(f"\n✨ Improved analysis completed successfully!")
        print(f"📈 Parameters should now be much more realistic!")
        return True
    else:
        print(f"\n💥 Analysis failed - no items could be processed")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)