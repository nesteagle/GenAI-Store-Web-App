from collections import defaultdict
from langchain.schema import BaseMessage
from typing import List, Dict
from backend.models import Item
from backend.services.item_services import get_items_service
from backend.database import get_db_session


session_histories: defaultdict[str, list[BaseMessage]] = defaultdict(list)
items: List[Item] = []
items_dict: Dict[int, Item] = {}


def get_items():
    if not items:
        items.extend(get_items_service(search=None, db=get_db_session()))
    return items


def get_items_dict() -> Dict[int, Item]:
    current_items = get_items()
    return {item.id: item for item in current_items}


def get_session_history(user_id: str):
    return session_histories.get(user_id, [])


def set_session_history(user_id: str, messages: list):
    session_histories[user_id] = messages
