import cv2

face_cascade = cv2.CascadeClassifier(
    cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
)

cap = cv2.VideoCapture(0)

violation_count = 0
import time
no_face_start = None

while True:
    ret, frame = cap.read()

    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

    faces = face_cascade.detectMultiScale(gray, 1.3, 5)
    if len(faces) == 0:
        if no_face_start is None:
            no_face_start = time.time()
        elif time.time() - no_face_start > 3:
            cv2.putText(frame, "No Face Detected!", (50,50),
                        cv2.FONT_HERSHEY_SIMPLEX, 1, (0,0,255), 2)
            violation_count += 1
    else:
        no_face_start = None

    if len(faces) > 1:
        cv2.putText(frame, "Multiple Faces Detected!", (50,100),
                    cv2.FONT_HERSHEY_SIMPLEX, 1, (0,0,255), 2)
        violation_count += 1

    for (x, y, w, h) in faces:
        if len(faces) == 1:
            color = (0,255,0)
        else:
            color = (0,0,255)
        cv2.rectangle(frame,(x,y),(x+w,y+h),color,2)
    
   # cv2.putText(frame, f"Violations: {violation_count}", (10,30),
  #             cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255,255,255), 2)

    cv2.imshow("Face Detection", frame)
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()