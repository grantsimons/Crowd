"""init

Revision ID: 0001_init
Revises: 
Create Date: 2025-09-24
"""

from __future__ import annotations

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "0001_init"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "ideas",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("title", sa.String(length=120), nullable=False, unique=True),
        sa.Column("description", sa.Text(), nullable=False, server_default=""),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
    )
    op.create_index("ix_ideas_created", "ideas", ["created_at"], unique=False)

    op.create_table(
        "votes",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("idea_id", sa.Integer(), sa.ForeignKey("ideas.id", ondelete="CASCADE"), nullable=False),
        sa.Column("voter", sa.String(length=120), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.UniqueConstraint("idea_id", "voter", name="uq_vote_idea_voter"),
    )
    op.create_index("ix_votes_idea_id", "votes", ["idea_id"], unique=False)


def downgrade() -> None:
    op.drop_index("ix_votes_idea_id", table_name="votes")
    op.drop_table("votes")
    op.drop_index("ix_ideas_created", table_name="ideas")
    op.drop_table("ideas")

