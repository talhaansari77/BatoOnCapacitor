import { format } from "@/lib/customerFormatting";
import {useBatoText} from "@/lib/batoText";
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, X, Calendar, Activity } from "lucide-react";

import { motion, AnimatePresence } from "framer-motion";
import FeedbackModal from "./FeedbackModal";

export default function FeedbackNotification({ userEmail }) {
  const tr=useBatoText();
  const [showModal, setShowModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [dismissed, setDismissed] = useState([]);
  const queryClient = useQueryClient();

  const { data: pendingRequests } = useQuery({
    queryKey: ['feedbackRequests', userEmail],
    queryFn: async () => {
      const requests = await base44.entities.FeedbackRequest.filter({
        client_email: userEmail,
        status: 'pending'
      }, '-sent_date');
      return requests;
    },
    enabled: !!userEmail,
    initialData: [],
    refetchInterval: 60000, // Refetch every minute
  });

  const visibleRequests = pendingRequests.filter(req => !dismissed.includes(req.id));

  const handleOpenFeedback = async (request) => {
    setSelectedRequest(request);
    
    // Fetch related session or appointment
    if (request.session_id) {
      const sessions = await base44.entities.TreatmentSession.filter({ id: request.session_id });
      request.session = sessions[0];
    } else if (request.appointment_id) {
      const appointments = await base44.entities.Appointment.filter({ id: request.appointment_id });
      request.appointment = appointments[0];
    }
    
    setShowModal(true);
  };

  const handleDismiss = (requestId) => {
    setDismissed([...dismissed, requestId]);
  };

  const handleFeedbackSubmitted = () => {
    queryClient.invalidateQueries({ queryKey: ['feedbackRequests'] });
    queryClient.invalidateQueries({ queryKey: ['sessions'] });
    setSelectedRequest(null);
  };

  if (visibleRequests.length === 0) return null;

  return (
    <>
      <AnimatePresence>
        {visibleRequests.slice(0, 3).map((request, index) => (
          <motion.div
            key={request.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: 200 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="mb-4"
          >
            <Card className="border-yellow-200 bg-yellow-50">
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <Star className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-1">{tr("Share Your Feedback")}</h3>
                        <p className="text-sm text-gray-700">
                          {request.type === 'treatment_session' 
                            ? 'How was your recent treatment session?' 
                            : 'How was your recent appointment?'}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDismiss(request.id)}
                        className="text-gray-400 hover:text-gray-600 -mt-1"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                      {request.type === 'treatment_session' ? (
                        <Activity className="w-3 h-3" />
                      ) : (
                        <Calendar className="w-3 h-3" />
                      )}
                      <span>{request.sent_date ? format(request.sent_date, "MMM d, yyyy") : ''}</span>
                    </div>
                    <Button
                      onClick={() => handleOpenFeedback(request)}
                      size="sm"
                      className="bg-yellow-500 hover:bg-yellow-600 text-white"
                    >
                      <Star className="w-4 h-4 mr-2" />
                      Give Feedback
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>

      {selectedRequest && (
        <FeedbackModal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            setSelectedRequest(null);
          }}
          feedbackRequest={selectedRequest}
          session={selectedRequest.session}
          appointment={selectedRequest.appointment}
          onFeedbackSubmitted={handleFeedbackSubmitted}
        />
      )}
    </>
  );
}