# Lumina Study 🧠✨
> Next-Generation AI-powered Study Assistant powered by **Gemma 4**.
Lumina Study is a modern, context-aware web application designed to help students, researchers, and professionals interact with their learning materials. Simply upload study documents (PDFs or TXT files), and let Lumina summarize the material, test your retention with custom quizzes, and answer questions interactively.
---
## 🚀 Key Features
*   **Interactive Contextual Chat**: Engage in deep Q&A sessions with your documents. Lumina uses Gemma 4 to explain complex topics, trace ideas, and provide educational context.
*   **Smart Summary Generator**: Automatically parse long documents and extract key concepts, structured chronologically or topically with clear headers and bullet points.
*   **Instant Quiz Creator**: Test your knowledge immediately by generating 3-question multiple-choice quizzes complete with answer keys.
*   **Premium Glassmorphic Design**: Built using pure vanilla CSS, featuring vibrant background blur blobs, shine-effect action cards, and interactive 3D parallax layers that follow mouse movements.
---
## 🛠️ Technology Stack
*   **Backend**: FastAPI, PyPDF2 (document text extraction), Uvicorn.
*   **AI Engine**: Google Generative AI SDK (`gemma-4-31b-it`).
*   **Frontend**: Vanilla HTML5, CSS3 (Glassmorphism & 3D Parallax), and JavaScript.
---
## ⚙️ Installation & Setup
Follow these steps to run Lumina Study locally on your machine:
### 1. Prerequisites
Ensure you have **Python 3.9+** installed on your system.
### 2. Clone the Repository
```bash
git clone https://github.com/your-username/lumina-study.git
cd lumina-study
```
### 3. Create a Virtual Environment
```bash
# On Windows
python -m venv .venv
.venv\Scripts\activate
# On macOS/Linux
python3 -m venv .venv
source .venv/bin/activate
```
### 4. Install Dependencies
```bash
pip install -r requirements.txt
```
### 5. Configure Environment Variables
Create a `.env` file in the root directory of the project and add your Gemini API Key:
```env
GEMINI_API_KEY=your_gemini_api_key_here
```
### 6. Run the Application
Start the FastAPI development server:
```bash
python app.py
```
Open your browser and navigate to:
```
http://127.0.0.1:8000
```
---
## 📖 Usage Guide
1.  **Welcome Screen**: Click the **Get Started** button on the home page.
2.  **Authentication**: Complete the registration or login screen (mock authentication flow) to access the study suite.
3.  **Upload Material**: Use the sidebar to select and upload any `.pdf` or `.txt` file.
4.  **Explore Document**:
    *   Click **Summarize** to get a bulleted summary.
    *   Click **Generate Quiz** to create an interactive test.
    *   Use the **Chat Box** to type custom questions about the uploaded content.
---
## 🤖 Gemma 4 Integration Details
Lumina Study is designed around the developer-focused instruction-tuned **Gemma 4 31B Dense model** (`gemma-4-31b-it`). 
- **System fallback**: In environments where the Gemma 4 API configuration is pending, the backend gracefully falls back to `gemini-1.5-flash` to ensure uninterrupted service.
- **Context Handling**: Ingests up to 100k characters of context per request, leveraging Gemma 4's high capacity to process detailed books, study guides, and slide decks.
