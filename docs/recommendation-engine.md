# Hybrid Recommendation Engine Documentation

## Core Scoring Formula

For each candidate course $C$, the engine calculates a normalized score (0–100):

$$\text{Recommendation Score} = w_1 S_{\text{gap}} + w_2 S_{\text{prereq}} + w_3 S_{\text{relevance}} + w_4 S_{\text{perf}} + w_5 S_{\text{diff}}$$

### Configurable Weight Matrix (`backend/src/config/recommendationConfig.js`):
- $w_1 = 0.30$ (Skill Gap Score)
- $w_2 = 0.25$ (Prerequisite Match Score)
- $w_3 = 0.20$ (Course Relevance Score via TF-IDF)
- $w_4 = 0.15$ (Performance Score)
- $w_5 = 0.10$ (Difficulty Fit Score)

### Component Scoring Details:
1. **Skill Gap Score ($S_{\text{gap}}$)**: Prioritizes skills where the student has the largest gap relative to target career requirements.
2. **Prerequisite Match Score ($S_{\text{prereq}}$)**: Penalizes courses whose prerequisites are not yet completed, flagging missing prerequisite courses first.
3. **Course Relevance Score ($S_{\text{relevance}}$)**: Computes TF-IDF vector cosine similarity between target career context text and course metadata.
4. **Performance Score ($S_{\text{perf}}$)**: Analyzes recent assessment and quiz scores. Scores < 40% prioritize foundational revision material.
5. **Difficulty Fit Score ($S_{\text{diff}}$)**: Matches student's current proficiency level against course difficulty (Beginner/Intermediate/Advanced).

### Explainability:
Every recommendation generates clear, natural language explanations derived directly from scoring metrics.
