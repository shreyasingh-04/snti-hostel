# app/core/scheduler.py
# Auto-deletes expired trainee accounts daily at midnight (PPT Phase 10)

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from datetime import datetime

scheduler = AsyncIOScheduler()

async def delete_expired_accounts():
    """
    Vocational Trainees -> deleted after 3 months
    Pre-Trainees        -> deleted after 2 years
    Runs automatically every day at midnight.
    """
    from app.core.database import AsyncSessionLocal
    from app.models.user import User
    from app.models.menu import Menu, Feedback
    from sqlalchemy import select, delete

    now = datetime.utcnow()
    async with AsyncSessionLocal() as db:
        result = await db.execute(
            select(User).where(User.role == "trainee", User.expires_at < now)
        )
        expired = result.scalars().all()
        count = len(expired)
        for user in expired:
            await db.execute(delete(Menu).where(Menu.user_id == user.id))
            await db.execute(delete(Feedback).where(Feedback.user_id == user.id))
            await db.delete(user)
        await db.commit()
        if count:
            print(f"[Scheduler] Auto-deleted {count} expired account(s) at {now}")

def start_scheduler():
    scheduler.add_job(
        delete_expired_accounts,
        trigger=CronTrigger(hour=0, minute=0),
        id="delete_expired",
        replace_existing=True,
    )
    scheduler.start()
    print("[Scheduler] Auto-delete scheduler started — runs daily at midnight.")
