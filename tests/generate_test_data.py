#!/usr/bin/env python3
"""
Test Data Generator for Japanese Learning App
Generates artificial usergrammarpointprogresses and uservocabularyprogresses data
in the exact MongoDB format for testing BKT analysis
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
        'easy': [str(ObjectId()) for _ in range(2)],
        'medium': [str(ObjectId()) for _ in range(2)], 
        'hard': [str(ObjectId()) for _ in range(1)]
    }

def generate_word_ids(count=8):
    """Generate word IDs with different difficulty levels"""
    return {
        'easy': [str(ObjectId()) for _ in range(3)],
        'medium': [str(ObjectId()) for _ in range(3)],
        'hard': [str(ObjectId()) for _ in range(2)]
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

def generate_progress_record(user_id, item_id, difficulty='medium', record_type='grammar'):
    """Generate a single progress record"""
    
    # Define success/failure ranges based on difficulty
    if difficulty == 'easy':
        success_range = (8, 25)   # More moderate ranges
        failure_range = (2, 8)
    elif difficulty == 'medium':
        success_range = (5, 20)
        failure_range = (4, 12)
    else:  # hard
        success_range = (2, 12)
        failure_range = (6, 18)
    
    # Some users might have zero attempts (new users)
    if random.random() < 0.15:  # 15% chance of no attempts yet
        success_count = 0
        failure_count = random.randint(0, 2)
    else:
        success_count = random.randint(*success_range)
        failure_count = random.randint(*failure_range)
    
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
        "__v": 0
    }
    
    # Add the correct field name based on record type
    if record_type == 'grammar':
        record["grammarPoint"] = {"$oid": item_id}
    else:  # word
        record["word"] = {"$oid": item_id}
    
    # Add success/failure counts
    record["successCount"] = success_count
    record["failureCount"] = failure_count
    
    # Add mastery score if there are any attempts
    if success_count > 0 or failure_count > 0:
        record["masteryScore"] = calculate_mastery_score(success_count, failure_count)
    
    return record

def generate_grammar_progress_data(user_ids, grammar_point_ids):
    """Generate grammar point progress data"""
    records = []
    
    for difficulty, grammar_ids in grammar_point_ids.items():
        for grammar_id in grammar_ids:
            # Each grammar point has progress records for random subset of users
            num_users = random.randint(8, 15)  # Not all users attempt every grammar point
            selected_users = random.sample(user_ids, num_users)
            
            for user_id in selected_users:
                record = generate_progress_record(user_id, grammar_id, difficulty, 'grammar')
                records.append(record)
    
    return records

def generate_word_progress_data(user_ids, word_ids):
    """Generate word progress data"""
    records = []
    
    for difficulty, vocab_ids in word_ids.items():
        for vocab_id in vocab_ids:
            # Each word has progress records for random subset of users
            num_users = random.randint(10, 18)
            selected_users = random.sample(user_ids, num_users)
            
            for user_id in selected_users:
                record = generate_progress_record(user_id, vocab_id, difficulty, 'word')
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
    print("🚀 Generating Test Data for Japanese Learning App")
    print("=" * 60)
    
    # Generate IDs
    user_ids = generate_user_ids(20)
    grammar_point_ids = generate_grammar_point_ids(5)
    word_ids = generate_word_ids(8)
    
    print(f"Generated {len(user_ids)} user IDs")
    print(f"Generated {sum(len(ids) for ids in grammar_point_ids.values())} grammar points")
    print(f"Generated {sum(len(ids) for ids in word_ids.values())} words")
    
    # Generate progress data
    print("\n🎲 Generating progress records...")
    grammar_records = generate_grammar_progress_data(user_ids, grammar_point_ids)
    word_records = generate_word_progress_data(user_ids, word_ids)
    
    # Save data files
    print("\n💾 Saving data files...")
    
    with open('test_usergrammarpointprogresses.json', 'w') as f:
        json.dump(grammar_records, f, indent=2, default=str)
    
    with open('test_userwordprogresses.json', 'w') as f:
        json.dump(word_records, f, indent=2, default=str)
    
    save_item_mappings(grammar_point_ids, word_ids)
    
    # Print summary
    print_data_summary(grammar_records, word_records, grammar_point_ids, word_ids)
    
    print(f"\n✨ Test data generation completed!")
    print(f"Files created:")
    print(f"  - test_usergrammarpointprogresses.json")
    print(f"  - test_userwordprogresses.json") 
    print(f"  - item_difficulty_mappings.json")
    print(f"\nYou can now test the BKT analyzer with this data!")

if __name__ == "__main__":
    main()