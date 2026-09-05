from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel

from database import get_db
from models import Message


router = APIRouter(
    prefix="/messages",
    tags=["User Admin Messages"]
)


# ==================================================
# REQUEST SCHEMAS
# ==================================================

class SendMessageRequest(BaseModel):

    user_id: int

    message: str

    language: str = "en"

    priority: str = "normal"


class ReplyMessageRequest(BaseModel):

    user_id: int

    message: str

    language: str = "en"


# ==================================================
# USER SEND MESSAGE
# ==================================================

@router.post("/send")
def send_message(
    request: SendMessageRequest,
    db: Session = Depends(get_db)
):

    if not request.message.strip():

        raise HTTPException(
            status_code=400,
            detail="Message cannot be empty"
        )


    new_message = Message(

        user_id=request.user_id,

        sender="USER",

        message=request.message.strip(),

        status="UNREAD",

        sender_id=request.user_id,

        receiver_id=0,

        language=request.language,

        priority=request.priority,

        is_read=False

    )


    db.add(new_message)

    db.commit()

    db.refresh(new_message)


    return {

        "success": True,

        "message_id":
            new_message.id,

        "message":
            "Message sent to admin successfully."

    }


# ==================================================
# ADMIN GET ALL MESSAGES
# ==================================================

@router.get("/")
def get_messages(
    db: Session = Depends(get_db)
):

    messages = (

        db.query(Message)

        .order_by(
            Message.created_at.desc()
        )

        .all()

    )


    return {

        "success": True,

        "count": len(messages),

        "messages": [

            {

                "id":
                    item.id,

                "user_id":
                    item.user_id,

                "sender":
                    item.sender,

                "message":
                    item.message,

                "status":
                    item.status,

                "sender_id":
                    item.sender_id,

                "receiver_id":
                    item.receiver_id,

                "language":
                    item.language,

                "priority":
                    item.priority,

                "is_read":
                    item.is_read,

                "created_at":
                    item.created_at

            }

            for item in messages

        ]

    }


# ==================================================
# ADMIN REPLY
# ==================================================

@router.post("/reply")
def reply_to_user(
    request: ReplyMessageRequest,
    db: Session = Depends(get_db)
):

    if not request.message.strip():

        raise HTTPException(
            status_code=400,
            detail="Reply cannot be empty"
        )


    new_message = Message(

        user_id=request.user_id,

        sender="ADMIN",

        message=request.message.strip(),

        status="SENT",

        sender_id=0,

        receiver_id=request.user_id,

        language=request.language,

        priority="normal",

        is_read=False

    )


    db.add(new_message)

    db.commit()

    db.refresh(new_message)


    return {

        "success": True,

        "message_id":
            new_message.id,

        "message":
            "Reply sent to user successfully."

    }


# ==================================================
# USER CONVERSATION
# ==================================================

@router.get("/user/{user_id}")
def get_user_conversation(
    user_id: int,
    db: Session = Depends(get_db)
):

    messages = (

        db.query(Message)

        .filter(
            Message.user_id == user_id
        )

        .order_by(
            Message.created_at.asc()
        )

        .all()

    )


    return {

        "success": True,

        "user_id": user_id,

        "count": len(messages),

        "messages": [

            {

                "id":
                    item.id,

                "sender":
                    item.sender,

                "message":
                    item.message,

                "language":
                    item.language,

                "priority":
                    item.priority,

                "is_read":
                    item.is_read,

                "created_at":
                    item.created_at

            }

            for item in messages

        ]

    }