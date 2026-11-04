from typing import List, Optional
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status
from app.db.models import Exam, Question
from app.schemas.exam import ExamCreate, ExamResponse, ExamDetailResponse, QuestionResponse

async def get_exams(db: AsyncSession, only_active: bool = False) -> List[Exam]:
    stmt = select(Exam).options(selectinload(Exam.questions))
    if only_active:
        stmt = stmt.where(Exam.is_active == True)
    result = await db.execute(stmt)
    return list(result.scalars().all())

async def get_exam_by_id(db: AsyncSession, exam_id: str) -> Optional[Exam]:
    stmt = select(Exam).where(Exam.id == exam_id).options(selectinload(Exam.questions))
    result = await db.execute(stmt)
    return result.scalar_one_or_none()

async def create_exam(db: AsyncSession, exam_in: ExamCreate) -> Exam:
    exam = Exam(
        code=exam_in.code,
        title=exam_in.title,
        course=exam_in.course,
        description=exam_in.description,
        duration_minutes=exam_in.duration_minutes,
        total_marks=exam_in.total_marks,
        passing_marks=exam_in.passing_marks,
        is_active=exam_in.is_active,
        rules=exam_in.rules,
    )
    db.add(exam)
    await db.flush()

    if exam_in.questions:
        for q_in in exam_in.questions:
            q = Question(
                exam_id=exam.id,
                number=q_in.number,
                question_text=q_in.question_text,
                options=q_in.options,
                correct_option=q_in.correct_option,
                points=q_in.points,
                explanation=q_in.explanation,
            )
            db.add(q)

    await db.commit()
    await db.refresh(exam)
    return exam

async def get_exam_questions(db: AsyncSession, exam_id: str, is_admin: bool = False) -> List[QuestionResponse]:
    exam = await get_exam_by_id(db, exam_id)
    if not exam:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Exam not found")
    
    questions = []
    for q in sorted(exam.questions, key=lambda x: x.number):
        questions.append(
            QuestionResponse(
                id=q.id,
                exam_id=q.exam_id,
                number=q.number,
                question_text=q.question_text,
                options=q.options,
                points=q.points,
                explanation=q.explanation if is_admin else None,
                correct_option=q.correct_option if is_admin else None,
            )
        )
    return questions
