let questions = [
    { 
        id: 1, 
        text: "What is the correct extension of a Python file?", 
        options: [".py", ".python", ".pyt", ".exe"] 
    },
    { 
        id: 2, 
        text: "Which of the following is used for comments in Python?", 
        options: ["//", "#", "/* */", ""] 
    },
    { 
        id: 3, 
        text: "Which keyword is used to create a function in Python?", 
        options: ["function", "def", "func", "define"] 
    }
];

let currentIndex = 0;
let userAnswers = {}; 

//  FETCH FROM DATABASE
async function loadQuestionsFromDB() {
    try {
        const res = await fetch("http://localhost:3000/api/exam/questions");
        const data = await res.json();
        console.log(data);

        questions = data.map(q => {
    const opts = [
    q.option_a,
    q.option_b,
    q.option_c,
    q.option_d
].filter(opt => opt);

    let correctText = "";

   if (q.correct_answer === "A") correctText = q.option_a;
if (q.correct_answer === "B") correctText = q.option_b;
if (q.correct_answer === "C") correctText = q.option_c;
if (q.correct_answer === "D") correctText = q.option_d;
    return {
    id: q.question_id,
   text: q.question_text || "Question",
    options: opts,
    correct_answer: correctText
};
});
        currentIndex = 0;
        updateExamUI(0);

        const palette = document.getElementById("palette");
        palette.innerHTML = "";

        questions.forEach((q, index) => {
            const span = document.createElement("span");
            span.innerText = index + 1;

            span.addEventListener("click", () => {
                currentIndex = index;
                updateExamUI(index);
            });

            palette.appendChild(span);
        });

    } catch (err) {
        console.log(err);
        alert("DB load failed, fallback to dummy questions");
        updateExamUI(0);
    }
}

// UI UPDATE
function updateExamUI(index) {
    const container = document.getElementById("questions");
    const paletteSpans = document.querySelectorAll('.grid span');

    const q = questions[index];

    container.innerHTML = `
        <p class="q-text"><b>Q${index + 1}. ${q.text}</b></p>
        <div class="options">
            ${q.options.map(opt => `
                <label>
                    <input type="radio" name="q${q.id}" value="${opt}" ${userAnswers[q.id] === opt ? "checked" : ""}>
                    ${opt}
                </label>
            `).join('')}
        </div>
    `;

    const radios = container.querySelectorAll('input[type="radio"]');
    radios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            userAnswers[q.id] = e.target.value;
        });
    });

    paletteSpans.forEach((span, i) => {
        span.classList.remove("active", "answered");

        if (i === index) {
            span.classList.add("active");
        }

        const qId = questions[i].id;

        if (userAnswers[qId]) {
            span.classList.add("answered");
        }
    });
}

// PREV
document.querySelector('.btn-prev').addEventListener('click', () => {
    if (currentIndex > 0) {
        currentIndex--;
        updateExamUI(currentIndex);
    }
});

// NEXT (FIXED)
document.querySelector('.btn-next').addEventListener('click', () => {

    if (currentIndex < questions.length - 1) {
        currentIndex++;
        updateExamUI(currentIndex);
    } else {
        alert("This is the last question.");
    }
});

// SUBMIT (FIXED)
document.querySelector('.btn-submit').addEventListener('click', async (e) => {

    e.preventDefault();

    let answers = [];

    questions.forEach(q => {

        let selected = userAnswers[q.id];

        let selectedOption = "";

        if (selected === q.options[0]) selectedOption = "A";
        if (selected === q.options[1]) selectedOption = "B";
        if (selected === q.options[2]) selectedOption = "C";
        if (selected === q.options[3]) selectedOption = "D";

        answers.push({
            question_id: q.id,
            selected_option: selectedOption
        });
    });

    try {

        const response = await fetch("http://localhost:3000/api/result/submit", {
            method: "POST",
           headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${localStorage.getItem("token")}`
},
            body: JSON.stringify({
                exam_id: 1,
                answers: answers
            })
        });

        const data = await response.json();
        console.log(data);

        

       document.querySelector(".main-layout").style.display = "none";

        document.getElementById("resultBox").style.display = "block";

        document.getElementById("scoreText").innerText =
            `Your Score: ${data.score} / ${questions.length}`;
            clearInterval(timerInterval);
            time = 0;

    } catch (err) {
        console.error(err);
        alert("Failed to save result");
    }
});

function calculateScoreAndSubmit() {

    let score = 0;

    questions.forEach(q => {
        if (userAnswers[q.id] === q.correct_answer) {
            score++;
        }
    });

    clearInterval(timerInterval);
    time = 0;

    document.querySelector(".main-layout").style.display = "none";

    document.getElementById("resultBox").style.display = "block";

    document.getElementById("scoreText").innerText =
        `Your Score: ${score} / ${questions.length}`;
}

// LOAD QUESTIONS
loadQuestionsFromDB();

// TIMER
let time = 3600;

let timerInterval = setInterval(() => {
    if (time <= 0) {
        calculateScoreAndSubmit();
        return;
    }

    let mins = Math.floor(time / 60);
    let secs = time % 60;

    document.getElementById('time').innerHTML = 
        `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

    time--;
}, 1000);

// START CAMERA
async function startCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: true
        });

        const video = document.getElementById("webcam");

        video.srcObject = stream;

        console.log("Camera connected");

    } catch (err) {
        console.error("Camera error:", err);
        alert("Camera permission denied");
    }
}

startCamera();