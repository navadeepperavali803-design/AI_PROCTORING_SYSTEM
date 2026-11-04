import pytest

@pytest.mark.asyncio
async def test_root_and_health(client):
    res = await client.get("/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"

@pytest.mark.asyncio
async def test_auth_login_and_me(client):
    # 1. Student login
    res = await client.post("/api/v1/auth/login", json={
        "email": "sarah.chen@university.edu",
        "password": "password123"
    })
    assert res.status_code == 200
    data = res.json()
    assert "access_token" in data
    assert data["user"]["email"] == "sarah.chen@university.edu"
    assert data["user"]["role"] == "student"

    token = data["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Get profile via /auth/me
    me_res = await client.get("/api/v1/auth/me", headers=headers)
    assert me_res.status_code == 200
    me_data = me_res.json()
    assert me_data["email"] == "sarah.chen@university.edu"
    assert me_data["student_id"] == "STD-2024-8921"

@pytest.mark.asyncio
async def test_auth_registration(client):
    new_email = "new.student@university.edu"
    reg_res = await client.post("/api/v1/auth/register", json={
        "email": new_email,
        "full_name": "New Student",
        "password": "secretPassword!",
        "role": "student",
        "student_id": "STD-2024-9999",
        "department": "Informatics"
    })
    assert reg_res.status_code == 201
    reg_data = reg_res.json()
    assert reg_data["email"] == new_email

    # Try duplicate registration -> should fail with 400
    dup_res = await client.post("/api/v1/auth/register", json={
        "email": new_email,
        "full_name": "New Student",
        "password": "secretPassword!",
    })
    assert dup_res.status_code == 400

@pytest.mark.asyncio
async def test_list_exams(client):
    res = await client.get("/api/v1/exams")
    assert res.status_code == 200
    exams = res.json()
    assert len(exams) >= 1
    assert exams[0]["code"] == "CS-401"
    assert exams[0]["total_questions"] == 10

@pytest.mark.asyncio
async def test_get_exam_questions(client):
    login_res = await client.post("/api/v1/auth/login", json={
        "email": "sarah.chen@university.edu",
        "password": "password123"
    })
    token = login_res.json()["access_token"]

    headers = {"Authorization": f"Bearer {token}"}
    res = await client.get("/api/v1/exams/exam-cs-401/questions", headers=headers)
    assert res.status_code == 200
    questions = res.json()
    assert len(questions) == 10
    assert questions[0]["number"] == 1
    assert len(questions[0]["options"]) == 4

@pytest.mark.asyncio
async def test_session_lifecycle_and_grading(client):
    # 1. Start a session
    start_res = await client.post("/api/v1/sessions", json={
        "exam_id": "exam-cs-401",
        "student_id": "usr-student-001"
    })
    assert start_res.status_code == 201
    session_data = start_res.json()
    session_id = session_data["id"]
    assert session_data["status"] == "IN_PROGRESS"

    # 2. Log multiple proctoring events
    evt1_res = await client.post("/api/v1/events", json={
        "session_id": session_id,
        "event_type": "LOOKING_AWAY",
        "confidence": 0.88,
        "duration_seconds": 3.6,
        "event_metadata": {"yaw": 31.2, "pitch": -4.0}
    })
    assert evt1_res.status_code == 201
    evt1_id = evt1_res.json()["id"]

    evt2_res = await client.post("/api/v1/events", json={
        "session_id": session_id,
        "event_type": "PHONE_DETECTED",
        "confidence": 0.94,
        "duration_seconds": 2.1,
        "event_metadata": {"class": "cell phone"}
    })
    assert evt2_res.status_code == 201
    evt2_id = evt2_res.json()["id"]

    # 3. Filter events by type
    filtered_events = await client.get(f"/api/v1/events?session_id={session_id}&event_type=PHONE_DETECTED")
    assert filtered_events.status_code == 200
    phone_events = filtered_events.json()
    assert len(phone_events) == 1
    assert phone_events[0]["eventType"] == "PHONE_DETECTED"

    # 4. Update review status
    patch_res = await client.patch(f"/api/v1/events/{evt1_id}", json={
        "review_status": "CLEARED",
        "admin_notes": "Verified scratch paper calculation."
    })
    assert patch_res.status_code == 200
    assert patch_res.json()["reviewStatus"] == "CLEARED"

    # 5. Fetch questions to answer
    login_res = await client.post("/api/v1/auth/login", json={
        "email": "sarah.chen@university.edu",
        "password": "password123"
    })
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    questions_res = await client.get("/api/v1/exams/exam-cs-401/questions", headers=headers)
    questions = questions_res.json()

    # Submit answers for first 2 questions (Q1: correct is 1, Q2: correct is 2)
    answers = {
        questions[0]["id"]: 1, # Correct (10 pts)
        questions[1]["id"]: 0, # Incorrect (0 pts)
    }

    submit_res = await client.post(f"/api/v1/sessions/{session_id}/submit", json={
        "answers": answers
    })
    assert submit_res.status_code == 200
    submit_data = submit_res.json()
    assert submit_data["status"] == "SUBMITTED"
    assert submit_data["score"] == 10.0 # 10 / 100 * 100%

    # 6. Fetch formal report
    report_res = await client.get(f"/api/v1/reports/{session_id}")
    assert report_res.status_code == 200
    report = report_res.json()
    assert report["sessionId"] == session_id
    assert report["eventMetrics"]["total"] == 2
    assert report["eventMetrics"]["cleared"] == 1
    assert report["eventMetrics"]["pending"] == 1

def test_websocket_proctoring_telemetry():
    from starlette.testclient import TestClient
    from app.main import app
    import json

    with TestClient(app) as test_client:
        with test_client.websocket_connect("/ws/proctor/ses-101") as ws:
            ws.send_text(json.dumps({"type": "ping"}))
            data = ws.receive_json()
            assert data["type"] == "pong"
