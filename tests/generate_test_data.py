#!/usr/bin/env python3
"""
Test Data Generator for Japanese Learning App - IMPROVED VERSION
Generates artificial usergrammarpointprogresses and uservocabularyprogresses data
in the exact MongoDB format for testing BKT analysis with realistic learning patterns
"""

import json
import random
from datetime import datetime, timedelta

try:
    from bson import ObjectId
except ImportError:
    # Fallback if bson not available
    def ObjectId():
        import uuid
        return str(uuid.uuid4()).replace('-', '')[:24]

def generate_user_ids(count=20):
    """Generate a pool of user IDs to reuse across records"""
    return [str(ObjectId()) for _ in range(count)]

def generate_grammar_point_ids(count=5):
    """Generate grammar point IDs with different difficulty levels"""
    return {
        'easy': [str(ObjectId()) for _ in range(count//2)],      # About half are easy
        'medium': [str(ObjectId()) for _ in range(count//3)],    # About 1/3 are medium
        'hard': [str(ObjectId()) for _ in range(count//5)]       # About 1/5 are hard
    }

def generate_word_ids(count=8):
    """Generate word IDs with different difficulty levels"""
    return {
        'easy': [str(ObjectId()) for _ in range(count//2)],      # About half are easy
        'medium': [str(ObjectId()) for _ in range(count//3)],    # About 1/3 are medium
        'hard': [str(ObjectId()) for _ in range(count//6)]       # About 1/6 are hard
    }

def calculate_mastery_score(success_count, failure_count):
    """Calculate mastery score similar to your existing data"""
    if success_count + failure_count == 0:
        return 0.06  # Prior knowledge
    
    success_rate = success_count / (success_count + failure_count)
    
    # Your existing data shows scores like 0.2602739726027397
    # This formula creates similar values
    if success_rate == 0:
        return 0.2602739726027397  # Default for no successes
    
    return min(0.95, max(0.05, success_rate * 0.8 + 0.1))

def generate_realistic_learning_sequence(difficulty='medium', min_attempts=5, max_attempts=30):
    """Generate a realistic learning sequence with temporal 
    Based on if the grammar point or word is hard, medium or easy we assign different parameter to them and
    calculate each attempt if it got it right or wrong. the chance on getting it right icrease with the time"""
    
    # Base parameters by difficulty
    if difficulty == 'easy':
        initial_success_prob = 0.4
        learning_boost = 0.08  # 
        slip_prob = 0.1
    elif difficulty == 'medium':
        initial_success_prob = 0.25
        learning_boost = 0.06
        slip_prob = 0.15
    else:  # hard
        initial_success_prob = 0.15
        learning_boost = 0.04
        slip_prob = 0.20
    
    # Decide how many attempts
    num_attempts = random.randint(min_attempts, max_attempts)

    # Generate learning sequence
    sequence = []
    current_success_prob = initial_success_prob
    
    for attempt in range(num_attempts):
        # Learning effect: gradually improve success probability
        if attempt > 0:
            current_success_prob = min(0.95, current_success_prob + learning_boost)
        
        # Add some noise and slip probability
        actual_prob = current_success_prob * (1 - slip_prob) + (1 - current_success_prob) * 0.1
        
        # Determine if this attempt was successful
        success = random.random() < actual_prob
        sequence.append(1 if success else 0)
    
    return sequence

def generate_progress_record_with_sequence(user_id, item_id, difficulty='medium', record_type='grammar'):
    """Generate a progress record with realistic learning sequence"""
    
    # Some users might have no attempts yet (15% chance)
    if random.random() < 0.15:
        success_count = 0
        failure_count = 0
        sequence = []
    else:
        # Generate realistic learning sequence
        sequence = generate_realistic_learning_sequence(difficulty)
        success_count = sum(sequence)
        failure_count = len(sequence) - success_count
    
    # Generate realistic dates
    created_date = datetime.now() - timedelta(days=random.randint(1, 90))
    last_reviewed = created_date + timedelta(days=random.randint(0, 30))
    updated_date = last_reviewed + timedelta(minutes=random.randint(0, 60))
    
    record = {
        "_id": {"$oid": str(ObjectId())},
        "user": {"$oid": user_id},
        "lastReviewed": {"$date": last_reviewed.isoformat() + "Z"},
        "createdAt": {"$date": created_date.isoformat() + "Z"},
        "updatedAt": {"$date": updated_date.isoformat() + "Z"},
        "__v": 0,
        "successCount": success_count,
        "failureCount": failure_count
    }
    
    # Add the correct field name based on record type
    if record_type == 'grammar':
        record["grammarPoint"] = {"$oid": item_id}
    else:  # word
        record["word"] = {"$oid": item_id}
    
    # Add mastery score if there are attempts
    if success_count > 0 or failure_count > 0:
        record["masteryScore"] = calculate_mastery_score(success_count, failure_count)
    
    # Store the learning sequence for BKT analysis (optional - for debugging)
    if sequence:
        record["_debug_sequence"] = sequence  # Remove this in production
    
    return record

def generate_grammar_progress_data_improved(user_ids, grammar_point_ids):
    """Generate improved grammar point progress data with better coverage"""
    records = []
    
    for difficulty, grammar_ids in grammar_point_ids.items():
        for grammar_id in grammar_ids:
            # Ensure better coverage - more users per item
            if difficulty == 'easy':
                num_users = random.randint(int(len(user_ids) * 0.6), int(len(user_ids) * 0.8))  # 60-80% of users
            elif difficulty == 'medium':
                num_users = random.randint(int(len(user_ids) * 0.4), int(len(user_ids) * 0.6))  # 40-60% of users
            else:  # hard
                num_users = random.randint(int(len(user_ids) * 0.2), int(len(user_ids) * 0.4))  # 20-40% of users
            
            # Don't exceed total user count
            num_users = min(num_users, len(user_ids))
            selected_users = random.sample(user_ids, num_users)
            
            for user_id in selected_users:
                record = generate_progress_record_with_sequence(user_id, grammar_id, difficulty, 'grammar')
                records.append(record)
    
    return records

def generate_word_progress_data_improved(user_ids, word_ids):
    """Generate improved word progress data with better coverage"""
    records = []
    
    for difficulty, vocab_ids in word_ids.items():
        for vocab_id in vocab_ids:
            # Words typically have higher engagement than grammar
            if difficulty == 'easy':
                num_users = random.randint(int(len(user_ids) * 0.7), int(len(user_ids) * 0.9))  # 70-90% of users
            elif difficulty == 'medium':
                num_users = random.randint(int(len(user_ids) * 0.5), int(len(user_ids) * 0.7))  # 50-70% of users
            else:  # hard
                num_users = random.randint(int(len(user_ids) * 0.3), int(len(user_ids) * 0.5))  # 30-50% of users
            
            # Don't exceed total user count
            num_users = min(num_users, len(user_ids))
            selected_users = random.sample(user_ids, num_users)
            
            for user_id in selected_users:
                record = generate_progress_record_with_sequence(user_id, vocab_id, difficulty, 'word')
                records.append(record)
    
    return records

def print_data_summary(grammar_records, word_records, grammar_point_ids, word_ids):
    """Print summary of generated data"""
    print(f"\n📊 Generated Data Summary:")
    print(f"Total Grammar Progress Records: {len(grammar_records)}")
    print(f"Total Word Progress Records: {len(word_records)}")
    
    print(f"\nGrammar Points by Difficulty:")
    for difficulty, ids in grammar_point_ids.items():
        count = sum(1 for r in grammar_records if r['grammarPoint']['$oid'] in ids)
        print(f"  {difficulty.capitalize()}: {len(ids)} points, {count} user records")
    
    print(f"\nWords by Difficulty:")
    for difficulty, ids in word_ids.items():
        count = sum(1 for r in word_records if r['word']['$oid'] in ids)
        print(f"  {difficulty.capitalize()}: {len(ids)} words, {count} user records")
    
    # Sample statistics
    grammar_successes = [r['successCount'] for r in grammar_records if r['successCount'] > 0]
    word_successes = [r['successCount'] for r in word_records if r['successCount'] > 0]
    
    if grammar_successes:
        print(f"\nAverage Success Counts (non-zero):")
        print(f"  Grammar: {sum(grammar_successes) / len(grammar_successes):.1f}")
    if word_successes:
        print(f"  Words: {sum(word_successes) / len(word_successes):.1f}")
    
    # Show some sequence examples
    sequences_found = [r for r in grammar_records + word_records if '_debug_sequence' in r][:3]
    if sequences_found:
        print(f"\nExample Learning Sequences:")
        for i, record in enumerate(sequences_found):
            seq = record['_debug_sequence']
            print(f"  Sequence {i+1}: {seq[:10]}{'...' if len(seq) > 10 else ''} (length: {len(seq)})")

def save_item_mappings(grammar_point_ids, word_ids):
    """Save mappings of item IDs to difficulty levels for reference"""
    mappings = {
        "grammar_points": grammar_point_ids,
        "words": word_ids,
        "generated_at": datetime.now().isoformat()
    }
    
    with open('item_difficulty_mappings.json', 'w') as f:
        json.dump(mappings, f, indent=2)
    
    print("💾 Item difficulty mappings saved to item_difficulty_mappings.json")

def main():
    """Generate test data in MongoDB export format"""
    print("🚀 Generating Test Data for Japanese Learning App - IMPROVED VERSION")
    print("=" * 70)
    
    # Generate IDs - CHANGE THESE VALUES TO SCALE:
    user_ids = generate_user_ids(100)              # 100 users (was 20)
    grammar_point_ids = generate_grammar_point_ids(25)  # 25 grammar points (was 5)
    word_ids = generate_word_ids(50)               # 50 words (was 8)
    
    print(f"Generated {len(user_ids)} user IDs")
    print(f"Generated {sum(len(ids) for ids in grammar_point_ids.values())} grammar points")
    print(f"Generated {sum(len(ids) for ids in word_ids.values())} words")
    
    # Show breakdown
    print(f"\nGrammar Points Breakdown:")
    for difficulty, ids in grammar_point_ids.items():
        print(f"  {difficulty.capitalize()}: {len(ids)} points")
    
    print(f"\nWords Breakdown:")
    for difficulty, ids in word_ids.items():
        print(f"  {difficulty.capitalize()}: {len(ids)} words")
    
    # Generate progress data with IMPROVED functions
    print("\n🎲 Generating realistic progress records with learning patterns...")
    grammar_records = generate_grammar_progress_data_improved(user_ids, grammar_point_ids)
    word_records = generate_word_progress_data_improved(user_ids, word_ids)
    
    # Save data files
    print("\n💾 Saving data files...")
    
    with open('test_usergrammarpointprogresses100.json', 'w') as f:
        json.dump(grammar_records, f, indent=2, default=str)
    
    with open('test_userwordprogresses100.json', 'w') as f:
        json.dump(word_records, f, indent=2, default=str)
    
    save_item_mappings(grammar_point_ids, word_ids)
    
    # Print summary
    print_data_summary(grammar_records, word_records, grammar_point_ids, word_ids)
    
    print(f"\n✨ Test data generation completed!")
    print(f"Files created:")
    print(f"  - test_usergrammarpointprogresses.json")
    print(f"  - test_userwordprogresses.json") 
    print(f"  - item_difficulty_mappings.json")
    print(f"\nYou can now test the BKT analyzer with this realistic data!")
    print(f"Expected improvement: More realistic BKT parameters with proper learning patterns")

if __name__ == "__main__":
    main()