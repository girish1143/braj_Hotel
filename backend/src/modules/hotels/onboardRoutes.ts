import { Router, Request, Response } from 'express';
import { logAudit } from '../audit/auditService';

const router = Router();

// In-memory store for submitted properties
const submittedProperties: any[] = [];

// POST /api/hotels/onboard - 7-Step Hotel Onboarding Submission
router.post('/', (req: Request, res: Response) => {
  try {
    const {
      hotelName,
      destination,
      address,
      nearestLandmark,
      contactPerson,
      phone,
      email,
      rooms,
      documents,
      satvikCompliancePledge
    } = req.body;

    if (!hotelName || !destination || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Missing required property details (hotelName, destination, phone)'
      });
    }

    const newPropertyId = `prop-sub-${Date.now()}`;
    const slug = hotelName.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    const newSubmission = {
      id: newPropertyId,
      name: hotelName,
      slug,
      destinationSlug: destination,
      address,
      nearestLandmark,
      contactPerson,
      phone,
      email,
      rooms: rooms || [],
      documents: documents || [],
      satvikCompliancePledge: Boolean(satvikCompliancePledge),
      status: 'SUBMITTED', // SUBMITTED -> System Admin Review -> APPROVED / REJECTED
      submittedAt: new Date().toISOString()
    };

    submittedProperties.push(newSubmission);

    logAudit(
      contactPerson || 'Property Owner',
      'HOTEL_CREATED',
      'Hotel',
      newPropertyId,
      `New property submission '${hotelName}' in ${destination}. Status set to SUBMITTED awaiting System Admin review.`,
      req.ip
    );

    res.status(201).json({
      success: true,
      message: 'Radhe Radhe! Your hotel application has been submitted successfully. Our System Admin team will verify your Satvik credentials & KYC documents before making the stay live.',
      data: newSubmission
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Onboarding failed', error: (error as Error).message });
  }
});

export default router;
