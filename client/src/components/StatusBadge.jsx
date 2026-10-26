import React from 'react';
import { Clock, CheckCircle2, XCircle, AlertCircle, ShieldAlert } from 'lucide-react';

export const StatusBadge = ({ status }) => {
  switch (status) {
    case 'Pending':
      return (
        <span className="badge badge-pending">
          <Clock size={12} /> Pending
        </span>
      );
    case 'Accepted':
      return (
        <span className="badge badge-accepted">
          <CheckCircle2 size={12} /> Accepted (Held)
        </span>
      );
    case 'Completed':
      return (
        <span className="badge badge-completed">
          <CheckCircle2 size={12} /> Completed
        </span>
      );
    case 'Declined':
      return (
        <span className="badge badge-declined">
          <XCircle size={12} /> Declined
        </span>
      );
    case 'Cancelled':
      return (
        <span className="badge badge-cancelled">
          <XCircle size={12} /> Cancelled
        </span>
      );
    case 'Disputed':
      return (
        <span className="badge badge-disputed">
          <ShieldAlert size={12} /> Disputed
        </span>
      );
    default:
      return <span className="badge">{status}</span>;
  }
};
