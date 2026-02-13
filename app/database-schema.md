# Firebase Firestore Schema

This document outlines the structure of the Firebase Firestore database used in the project.

## Collections and Documents

### 1. `personality_questions` Collection

- **Description**: Stores the questions for the personality quiz.
- **Document ID**: `question_<question.id>`
- **Fields**:
  - `id` (string): Unique identifier for the question.
  - Other fields are dynamically defined based on the `questions` array in `setupQuestions.ts`.

### 2. `personality_archetypes` Collection

- **Description**: Stores the archetypes for personality results.
- **Fields**:
  - `id` (string): Unique identifier for the archetype.
  - `title` (string): Name of the archetype.
  - `axes_target` (object): Numerical values for the following keys:
    - `HP` (number)
    - `WP` (number)
    - `HF` (number)
    - `CI` (number)
  - `description` (string): Text description of the archetype.
  - `imageUrl` (string): URL for an associated image.
  - `order` (number): Numerical order for sorting.

### 3. `personality_quiz_results` Collection

- **Description**: Stores the results of personality quizzes.
- **Fields**:
  - Fields are dynamically defined when results are added (e.g., `quizData` in `PersonalityQuiz.tsx`).

## Key Files

- **`setupQuestions.ts`**: Defines and uploads questions to the `personality_questions` collection.
- **`setupArchetypes.ts`**: Defines and uploads archetypes to the `personality_archetypes` collection.
- **`PersonalityQuiz.tsx`**: Handles quiz results and uploads them to the `personality_quiz_results` collection.

## Notes

- The database schema is flexible and may evolve as the project requirements change.
- Refer to the respective setup files for the most up-to-date field definitions.
