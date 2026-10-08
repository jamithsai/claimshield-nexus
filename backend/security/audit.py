"""
ClaimShield Nexus — Cryptographic Tamper-Evident Audit Ledger
Guarantees evidentiary provenance through SHA-256 hash chaining (Merkle chain).
"""

import hashlib
import json
import datetime
from typing import List, Dict, Any, Optional
from backend.data.models import AuditLogEntry, User
from backend.data.database import db

GENESIS_HASH = "0000000000000000000000000000000000000000000000000000000000000000"

class TamperEvidentAuditLedger:
    @staticmethod
    def _compute_hash(log_id: str, ts: str, actor: str, action: str, target: str, details_str: str, prev_hash: str) -> str:
        payload = f"{log_id}|{ts}|{actor}|{action}|{target}|{details_str}|{prev_hash}"
        return hashlib.sha256(payload.encode("utf-8")).hexdigest()

    @classmethod
    def record_action(
        cls, 
        user: User, 
        action_type: str, 
        target_resource: str, 
        details: Dict[str, Any],
        client_ip: str = "127.0.0.1"
    ) -> AuditLogEntry:
        log_id = f"AUD-{len(db.audit_logs) + 10001}"
        ts = datetime.datetime.now(datetime.timezone.utc).isoformat()
        
        prev_hash = db.audit_logs[-1].current_hash if db.audit_logs else GENESIS_HASH
        details_str = json.dumps(details, sort_keys=True)
        cur_hash = cls._compute_hash(log_id, ts, user.user_id, action_type, target_resource, details_str, prev_hash)
        
        entry = AuditLogEntry(
            log_id=log_id,
            timestamp=ts,
            actor_user_id=user.user_id,
            actor_username=user.username,
            actor_role=user.role,
            action_type=action_type,
            target_resource=target_resource,
            details=details,
            client_ip=client_ip,
            prev_hash=prev_hash,
            current_hash=cur_hash
        )
        db.add_audit_log(entry)
        return entry

    @classmethod
    def verify_chain_integrity(cls) -> Dict[str, Any]:
        logs = db.audit_logs
        if not logs:
            return {"status": "VALID", "total_entries": 0, "is_tampered": False}
            
        for i, entry in enumerate(logs):
            expected_prev = GENESIS_HASH if i == 0 else logs[i-1].current_hash
            if entry.prev_hash != expected_prev:
                return {
                    "status": "CHAIN_BROKEN_TAMPERING_DETECTED",
                    "tampered_at_index": i,
                    "tampered_log_id": entry.log_id,
                    "is_tampered": True
                }
                
            details_str = json.dumps(entry.details, sort_keys=True)
            recomputed = cls._compute_hash(
                entry.log_id, entry.timestamp, entry.actor_user_id,
                entry.action_type, entry.target_resource, details_str, entry.prev_hash
            )
            if recomputed != entry.current_hash:
                return {
                    "status": "PAYLOAD_HASH_MISMATCH_TAMPERING_DETECTED",
                    "tampered_at_index": i,
                    "tampered_log_id": entry.log_id,
                    "is_tampered": True
                }
                
        return {
            "status": "VALID_MERKLE_CHAIN",
            "total_entries": len(logs),
            "is_tampered": False,
            "latest_head_hash": logs[-1].current_hash
        }
