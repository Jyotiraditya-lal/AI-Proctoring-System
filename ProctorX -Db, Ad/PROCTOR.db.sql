BEGIN TRANSACTION;
CREATE TABLE IF NOT EXISTS "Exams" (
	"exam_id"	INTEGER,
	"exam_name"	TEXT NOT NULL,
	"duration"	INTEGER NOT NULL,
	"created_by"	INTEGER,
	PRIMARY KEY("exam_id" AUTOINCREMENT),
	FOREIGN KEY("created_by") REFERENCES "Users"("user_id")
);
CREATE TABLE IF NOT EXISTS "Questions" (
	"question_id"	INTEGER,
	"exam_id"	INTEGER,
	"question_text"	TEXT NOT NULL,
	"option_a"	TEXT NOT NULL,
	"option_b"	TEXT NOT NULL,
	"option_c"	TEXT NOT NULL,
	"option_d"	TEXT NOT NULL,
	"correct_answer"	TEXT NOT NULL CHECK("correct_answer" IN ('A', 'B', 'C', 'D')),
	PRIMARY KEY("question_id" AUTOINCREMENT),
	FOREIGN KEY("exam_id") REFERENCES "Exams"("exam_id")
);
CREATE TABLE IF NOT EXISTS "Results" (
	"result_id"	INTEGER,
	"user_id"	INTEGER,
	"exam_id"	INTEGER,
	"score"	INTEGER,
	PRIMARY KEY("result_id" AUTOINCREMENT),
	FOREIGN KEY("exam_id") REFERENCES "Exams"("exam_id"),
	FOREIGN KEY("user_id") REFERENCES "Users"("user_id")
);
CREATE TABLE IF NOT EXISTS "Users" (
	"user_id"	INTEGER,
	"name"	TEXT NOT NULL,
	"email"	TEXT NOT NULL UNIQUE,
	"password"	TEXT NOT NULL,
	"role"	TEXT NOT NULL CHECK("role" IN ('admin', 'student')),
	PRIMARY KEY("user_id" AUTOINCREMENT)
);
CREATE TABLE IF NOT EXISTS "Violations" (
	"violation_id"	INTEGER,
	"user_id"	INTEGER,
	"exam_id"	INTEGER,
	"violation_type"	TEXT NOT NULL,
	"timestamp"	DATETIME DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY("violation_id" AUTOINCREMENT),
	FOREIGN KEY("exam_id") REFERENCES "Exams"("exam_id"),
	FOREIGN KEY("user_id") REFERENCES "Users"("user_id")
);
INSERT INTO "Exams" VALUES (1,'Math Test',60,1);
INSERT INTO "Exams" VALUES (2,'Math Midterm',60,NULL);
INSERT INTO "Questions" VALUES (1,1,'2 + 2 = ?','3','4','5','6','B');
INSERT INTO "Questions" VALUES (2,1,'5 * 3 = ?','15','10','20','8','A');
INSERT INTO "Questions" VALUES (3,1,'10 - 4 = ?','3','5','6','7','C');
INSERT INTO "Questions" VALUES (4,1,'9 / 3 = ?','1','2','3','4','C');
INSERT INTO "Questions" VALUES (5,1,'What is 2 + 2?','3','4','5','6','B');
INSERT INTO "Questions" VALUES (6,1,'What is 5 x 3?','15','10','20','25','A');
INSERT INTO "Questions" VALUES (7,1,'What is 10 / 2?','2','3','5','8','C');
INSERT INTO "Users" VALUES (1,'Admin','admin@gmail.com','1234','admin');
INSERT INTO "Users" VALUES (2,'Student1','student@gmail.com','1234','student');
INSERT INTO "Violations" VALUES (1,2,1,'Multiple Face Detected','2026-02-18 12:55:15');
COMMIT;
