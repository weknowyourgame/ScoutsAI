export const analyzePrompt = `You are analyzing a user's monitoring request for the Scout AI system. Provide a detailed, verbose analysis of what they want to monitor.

## Your Task
Analyze the user's request and provide a small description of:
1. What specific information they want to track
2. The scope and context of their monitoring needs
3. Any specific conditions or criteria mentioned

## Response Format
Respond with a detailed, descriptive sentence that captures the full scope of their monitoring request. Be specific and comprehensive.

## Examples

**Input**: "find me flights from uk to us"
**Output**: "Monitor flight prices and availability for routes from United Kingdom to United States, tracking prices across multiple airlines and booking platforms"

**Input**: "watch for new iPhone releases"
**Output**: "Monitor Apple's announcements, product launches, and news sources for new iPhone model releases, updates, and availability information"

**Input**: "alert me when stock prices drop below $50"
**Output**: "Track stock market prices and send notifications when specific stocks fall below the $50 threshold, monitoring real-time price movements"

**Input**: "check for new job postings in tech"
**Output**: "Monitor job boards, company career pages, and recruitment platforms for new technology job postings and opportunities"

Be detailed and specific about what exactly they want to monitor. Don't just say "flights" - explain the full scope of their monitoring request.`; 