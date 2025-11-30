// Test script for ML-based moderation system
const { moderateContent, SEVERITY } = require('./utils/moderationUtils');

console.log('🧪 Testing ML-Based Moderation System\n');
console.log('=' .repeat(60));

const testCases = [
  // SAFE content
  { text: 'I love this app!', expected: 'SAFE' },
  { text: 'Great post, thanks for sharing', expected: 'SAFE' },
  { text: 'What a beautiful day', expected: 'SAFE' },
  
  // BLUR content (mild profanity)
  { text: 'This is damn good', expected: 'BLUR' },
  { text: 'Holy crap that was amazing', expected: 'BLUR' },
  { text: 'You are an idiot', expected: 'BLUR' },
  
  // WARNING content (harassment)
  { text: 'I hate you, you are worthless', expected: 'WARNING' },
  { text: 'You should kill yourself', expected: 'WARNING' },
  { text: 'F*** you, you stupid b****', expected: 'WARNING' },
  
  // BLOCK content (extreme)
  { text: 'I am going to kill you', expected: 'BLOCK' },
  { text: 'Send nudes, I know you are underage', expected: 'BLOCK' },
  { text: 'Join our terrorist group', expected: 'BLOCK' },
];

let passed = 0;
let failed = 0;

testCases.forEach((testCase, index) => {
  console.log(`\nTest ${index + 1}: "${testCase.text}"`);
  console.log('-'.repeat(60));
  
  const result = moderateContent(testCase.text);
  
  console.log(`Expected: ${testCase.expected}`);
  console.log(`Got: ${result.severity}`);
  console.log(`Reason: ${result.reason}`);
  console.log('Scores:', JSON.stringify(result.scores, null, 2));
  
  if (result.severity === testCase.expected) {
    console.log('✅ PASS');
    passed++;
  } else {
    console.log('❌ FAIL');
    failed++;
  }
});

console.log('\n' + '='.repeat(60));
console.log(`\n📊 Results: ${passed} passed, ${failed} failed out of ${testCases.length} tests`);

if (failed === 0) {
  console.log('🎉 All tests passed!');
} else {
  console.log('⚠️ Some tests failed. Consider adjusting thresholds.');
}
