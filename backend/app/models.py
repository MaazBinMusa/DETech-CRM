from __future__ import annotations

from typing import Optional

from pydantic import BaseModel, Field


class AuthCredentials(BaseModel):
    email: str
    password: str = Field(min_length=6)


class CustomerCodeCreate(BaseModel):
    industry_code: str = Field(min_length=2, max_length=2)
    customer_code: str = Field(min_length=4, max_length=4)


class CustomerCreate(BaseModel):
    customer_name: str
    contact_name: Optional[str] = None
    industry: Optional[str] = None
    customer_code: str
    email: Optional[str] = None
    phone: Optional[str] = None
    notes: Optional[str] = None


class QuotationCreate(BaseModel):
    customer_name: str
    rfq_description: str
    rfq_date: str
    due_date: Optional[str] = None
    status: str
    po_status: Optional[str] = None
    po_amount: Optional[float] = None
    bid_security: Optional[float] = None
    remarks: Optional[str] = None
