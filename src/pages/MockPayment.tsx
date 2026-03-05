/**
 * MockPayment.tsx
 *
 * This file is kept for backwards compatibility with existing routes
 * (/payment/mock/:paymentId). It immediately redirects to the unified
 * PaynowPayment page which handles both mock and real Paynow flows.
 */
import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function MockPayment() {
  const { paymentId } = useParams<{ paymentId: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    if (paymentId) {
      navigate(`/payment/${paymentId}`, { replace: true });
    } else {
      navigate("/wallet", { replace: true });
    }
  }, [paymentId, navigate]);

  return null;
}