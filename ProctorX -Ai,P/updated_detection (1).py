import requests
import cv2
import time

# Load model
face_cascade = cv2.CascadeClassifier(
    cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
)

cap = cv2.VideoCapture(0)

# SETTINGS
COOLDOWN = 5
FRAME_THRESHOLD = 15
MIN_FACE_AREA = 6000   # 🔥 background filter

# VARIABLES
violation_count = 0
no_face_frames = 0
multi_face_frames = 0
last_violation_time = 0
current_state = "NORMAL"

while True:
    ret, frame = cap.read()
    if not ret:
        break

    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

    # Detect faces
    faces = face_cascade.detectMultiScale(gray, 1.1, 5)

    # FILTER BACKGROUND FACES
    valid_faces = []
    for (x, y, w, h) in faces:
        if w * h > MIN_FACE_AREA:
            valid_faces.append((x, y, w, h))

    face_count = len(valid_faces)
    current_time = time.time()

    state = "NORMAL"

    # MULTIPLE FACE DETECTION
    if face_count > 1:
        multi_face_frames += 1
        no_face_frames = 0

        if multi_face_frames > FRAME_THRESHOLD:
            state = "MULTIPLE_FACE"

    # NO FACE DETECTION
    elif face_count == 0:
        no_face_frames += 1
        multi_face_frames = 0

        if no_face_frames > FRAME_THRESHOLD:
            state = "NO_FACE"

    else:
        no_face_frames = 0
        multi_face_frames = 0

    # COOLDOWN SYSTEM + API CALL
    if state != "NORMAL":
        if current_time - last_violation_time > COOLDOWN:
            violation_count += 1
            last_violation_time = current_time
            current_state = state

            # ✅ API ADDED HERE
            try:
                if state == "NO_FACE":
                    requests.post(
                        "http://localhost:3000/api/exam/violation",
                        json={
                            "user_id": 1,
                            "exam_id": 1,
                            "violation_type": "no_face"
                        }
                    )

                elif state == "MULTIPLE_FACE":
                    requests.post(
                        "http://localhost:3000/api/exam/violation",
                        json={
                            "user_id": 1,
                            "exam_id": 1,
                            "violation_type": "multiple_face"
                        }
                    )

            except Exception as e:
                print("API Error:", e)

    else:
        current_state = "NORMAL"

    # COLOR LOGIC
    box_color = (0, 255, 0)

    if current_state == "MULTIPLE_FACE":
        box_color = (0, 0, 255)
        cv2.putText(frame, "Multiple Faces Detected!", (50,50),
                    cv2.FONT_HERSHEY_SIMPLEX, 1, (0,0,255), 2)

    elif current_state == "NO_FACE":
        box_color = (0, 0, 255)
        cv2.putText(frame, "No Face Detected!", (50,50),
                    cv2.FONT_HERSHEY_SIMPLEX, 1, (0,0,255), 2)

    # DRAW
    for (x, y, w, h) in valid_faces:
        cv2.rectangle(frame, (x,y), (x+w,y+h), box_color, 2)

    # UI TEXT
    cv2.putText(frame, f"Violations: {violation_count}", (10,30),
                cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255,255,255), 2)

    cv2.putText(frame, f"Faces: {face_count}", (10,60),
                cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255,255,0), 2)

    cv2.putText(frame, f"State: {current_state}", (10,90),
                cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255,255,0), 2)

    cv2.imshow("ProctorX AI Monitoring", frame)

    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()