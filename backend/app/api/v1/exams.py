from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.database import get_db
from app.schemas.exam import ExamCreate, ExamResponse, ExamDetailResponse, QuestionResponse
from app.services.exam_service import get_exams, get_exam_by_id, create_exam, get_exam_questions
from app.services.auth_service import get_current_user, get_current_admin

router = APIRouter(prefix="/exams", tags=["Exams"])

@router.get("", response_model=List[ExamResponse])
async def list_exams(db: AsyncSession = Depends(get_db)):
    exams = await get_exams(db, only_active=False)
    # Map questions count
    output = []
    for e in exams:
        resp = ExamResponse.model_validate(e)
        resp.total_questions = len(e.questions)
        output.append(resp)
    return output

@router.get("/{exam_id}", response_model=ExamDetailResponse)
async def get_exam(exam_id: str, db: AsyncSession = Depends(get_db)):
    exam = await get_exam_by_id(db, exam_id)
    if not exam:
        raise HTTPException(status_code=404, detail="Exam not found")
    resp = ExamDetailResponse.model_validate(exam)
    resp.total_questions = len(exam.questions)
    return resp

@router.post("", response_model=ExamResponse, status_code=status.HTTP_201_CREATED)
async def create_new_exam(
    exam_in: ExamCreate,
    db: AsyncSession = Depends(get_db),
    admin=Depends(get_current_admin),
):
    exam = await create_exam(db, exam_in)
    return exam

@router.get("/{exam_id}/questions", response_model=List[QuestionResponse])
async def get_questions_for_exam(
    exam_id: str,
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user),
):
    is_admin = user.role in ["admin", "proctor"]
    questions = await get_exam_questions(db, exam_id, is_admin=is_admin)
    return questions
