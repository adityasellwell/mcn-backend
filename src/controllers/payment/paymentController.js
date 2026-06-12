import prisma from "../../config/prisma.js";
import cloudinary from "../../config/cloudinary.js";
import streamifier from "streamifier";

const uploadToCloudinary = (fileBuffer, folder) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
      },
      (error, result) => {
        if (error) return reject(error);

        resolve(result);
      }
    );

    streamifier.createReadStream(fileBuffer).pipe(stream);
  });
};

export const uploadMemberPayment = async (req, res) => {

try {

    if (
      !process.env.CLOUDINARY_CLOUD_NAME ||
      !process.env.CLOUDINARY_API_KEY ||
      !process.env.CLOUDINARY_API_SECRET
    ) {
      return res.status(500).json({
        success: false,
        message: "Cloudinary not configured",
      });
    }

    const { id } = req.params;
    const { utrNumber } = req.body;

    const meetingMember = await prisma.meetingMember.findUnique({
      where: {
        id: Number(id),
      },
    });

    if (!utrNumber) {
        return res.status(400).json({
            success: false,
            message: "UTR Number is required",
        });
        }

    if (!meetingMember) {
      return res.status(404).json({
        success: false,
        message: "Meeting member not found",
      });
    }

    let paymentScreenshot = null;

    if (req.file) {
      const uploadedFile = await uploadToCloudinary(
        req.file.buffer,
        "mcn/payments"
      );

      paymentScreenshot = uploadedFile.secure_url;
    }

    const updatedPayment = await prisma.meetingMember.update({
      where: {
        id: Number(id),
      },
      data: {
        utrNumber,
        paymentScreenshot,
        paymentStatus: "SUBMITTED",
      },
    });

    return res.status(200).json({
      success: true,
      message: "Payment submitted successfully",
      data: updatedPayment,
    });
  
} catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const uploadVisitorPayment = async (req, res) => {

     try {

    if (
      !process.env.CLOUDINARY_CLOUD_NAME ||
      !process.env.CLOUDINARY_API_KEY ||
      !process.env.CLOUDINARY_API_SECRET
    ) {
      return res.status(500).json({
        success: false,
        message: "Cloudinary not configured",
      });
    }

    const { id } = req.params;
    const { utrNumber } = req.body;

    const meetingVisitor = await prisma.meetingVisitor.findUnique({
      where: {
        id: Number(id),
      },
    });

    if (!utrNumber) {
  return res.status(400).json({
    success: false,
    message: "UTR Number is required",
  });
}

    if (!meetingVisitor) {
      return res.status(404).json({
        success: false,
        message: "Meeting visitor not found",
      });
    }

    let paymentScreenshot = null;

    if (req.file) {
      const uploadedFile = await uploadToCloudinary(
        req.file.buffer,
        "mcn/payments"
      );

      paymentScreenshot = uploadedFile.secure_url;
    }

    const updatedPayment = await prisma.meetingVisitor.update({
      where: {
        id: Number(id),
      },
      data: {
        utrNumber,
        paymentScreenshot,
        paymentStatus: "SUBMITTED",
      },
    });

    await prisma.visitor.update({
      where: {
        id: meetingVisitor.visitorId,
      },
      data: {
        status: "PAYMENT_SUBMITTED",
      },
    });

    return res.status(200).json({
      success: true,
      message: "Payment submitted successfully",
      data: updatedPayment,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const approveVisitorPayment = async (req, res) => {
  try {
    const { id } = req.params;

    const payment = await prisma.meetingVisitor.update({
      where: {
        id: Number(id),
      },
      data: {
        paymentStatus: "APPROVED",
      },
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    await prisma.visitor.update({
      where: {
        id: payment.visitorId,
      },
      data: {
        status: "PAID",
      },
    });

    return res.status(200).json({
      success: true,
      message: "Payment approved successfully",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// export const rejectVisitorPayment = async (req, res) => {
//   try {
//     const { id } = req.params;

//     await prisma.meetingVisitor.update({
//       where: {
//         id: Number(id),
//       },
//       data: {
//         paymentStatus: "REJECTED",
//       },
//     });

//     if (!payment) {
//   return res.status(404).json({
//     success: false,
//     message: "Meeting member not found",
//   });
// }

//     return res.status(200).json({
//       success: true,
//       message: "Payment rejected successfully",
//     });
//   } catch (error) {
//     console.error(error);

//     return res.status(500).json({
//       success: false,
//       message: "Internal Server Error",
//     });
//   }
// };

// export const approveMemberPayment = async (req, res) => {
//   try {
//     const { id } = req.params;

//     await prisma.meetingMember.update({
//       where: {
//         id: Number(id),
//       },
//       data: {
//         paymentStatus: "APPROVED",
//       },
//     });

//     if (!payment) {
//         return res.status(404).json({
//             success: false,
//             message: "Meeting member not found",
//         });
//         }

//     return res.status(200).json({
//       success: true,
//       message: "Payment approved successfully",
//     });
//   } catch (error) {
//     console.error(error);

//     return res.status(500).json({
//       success: false,
//       message: "Internal Server Error",
//     });
//   }
// };

// export const rejectMemberPayment = async (req, res) => {
//   try {
//     const { id } = req.params;

//     await prisma.meetingMember.update({
//       where: {
//         id: Number(id),
//       },
//       data: {
//         paymentStatus: "REJECTED",
//       },
//     });

//     if (!payment) {
//   return res.status(404).json({
//     success: false,
//     message: "Meeting member not found",
//   });
// }

//     return res.status(200).json({
//       success: true,
//       message: "Payment rejected successfully",
//     });
//   } catch (error) {
//     console.error(error);

//     return res.status(500).json({
//       success: false,
//       message: "Internal Server Error",
//     });
//   }
// };

// ─── Approve Member Payment ───
export const approveMemberPayment = async (req, res) => {
  try {
    const { id } = req.params;

    const payment = await prisma.meetingMember.findUnique({
      where: { id: Number(id) },
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    await prisma.meetingMember.update({
      where: { id: Number(id) },
      data: { paymentStatus: "APPROVED" },
    });

    return res.status(200).json({
      success: true,
      message: "Payment approved successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// ─── Reject Member Payment ───
export const rejectMemberPayment = async (req, res) => {
  try {
    const { id } = req.params;

    const payment = await prisma.meetingMember.findUnique({
      where: { id: Number(id) },
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    await prisma.meetingMember.update({
      where: { id: Number(id) },
      data: { paymentStatus: "REJECTED" },
    });

    return res.status(200).json({
      success: true,
      message: "Payment rejected successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// ─── Reject Visitor Payment ───
export const rejectVisitorPayment = async (req, res) => {
  try {
    const { id } = req.params;

    const payment = await prisma.meetingVisitor.findUnique({
      where: { id: Number(id) },
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    await prisma.meetingVisitor.update({
      where: { id: Number(id) },
      data: { paymentStatus: "REJECTED" },
    });

    return res.status(200).json({
      success: true,
      message: "Payment rejected successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
export const getAllPayments = async (req, res) => {
  try {
    const memberPayments = await prisma.meetingMember.findMany({
      include: {
        member: true,
        meeting: true,
      },
    });

    const visitorPayments = await prisma.meetingVisitor.findMany({
      include: {
        visitor: true,
        meeting: true,
      },
    });

    const payments = [
      ...memberPayments.map((payment) => ({
        paymentType: "MEMBER",
        ...payment,
      })),

      ...visitorPayments.map((payment) => ({
        paymentType: "VISITOR",
        ...payment,
      })),
    ];

    payments.sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    return res.status(200).json({
      success: true,
      count: payments.length,
      data: payments,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const getPendingPayments = async (req, res) => {
  try {
    const memberPayments = await prisma.meetingMember.findMany({
      where: {
        paymentStatus: "SUBMITTED",
      },
      include: {
        member: true,
        meeting: true,
      },
    });

    const visitorPayments = await prisma.meetingVisitor.findMany({
      where: {
        paymentStatus: "SUBMITTED",
      },
      include: {
        visitor: true,
        meeting: true,
      },
    });

    const payments = [
      ...memberPayments.map((payment) => ({
        paymentType: "MEMBER",
        ...payment,
      })),

      ...visitorPayments.map((payment) => ({
        paymentType: "VISITOR",
        ...payment,
      })),
    ];

    return res.status(200).json({
      success: true,
      count: payments.length,
      data: payments,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const getApprovedPayments = async (req, res) => {
  try {
    const memberPayments = await prisma.meetingMember.findMany({
      where: {
        paymentStatus: "APPROVED",
      },
      include: {
        member: true,
        meeting: true,
      },
    });

    const visitorPayments = await prisma.meetingVisitor.findMany({
      where: {
        paymentStatus: "APPROVED",
      },
      include: {
        visitor: true,
        meeting: true,
      },
    });

    const payments = [
      ...memberPayments.map((payment) => ({
        paymentType: "MEMBER",
        ...payment,
      })),

      ...visitorPayments.map((payment) => ({
        paymentType: "VISITOR",
        ...payment,
      })),
    ];

    return res.status(200).json({
      success: true,
      count: payments.length,
      data: payments,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const getRejectedPayments = async (req, res) => {
  try {
    const memberPayments = await prisma.meetingMember.findMany({
      where: {
        paymentStatus: "REJECTED",
      },
      include: {
        member: true,
        meeting: true,
      },
    });

    const visitorPayments = await prisma.meetingVisitor.findMany({
      where: {
        paymentStatus: "REJECTED",
      },
      include: {
        visitor: true,
        meeting: true,
      },
    });

    const payments = [
      ...memberPayments.map((payment) => ({
        paymentType: "MEMBER",
        ...payment,
      })),

      ...visitorPayments.map((payment) => ({
        paymentType: "VISITOR",
        ...payment,
      })),
    ];

    return res.status(200).json({
      success: true,
      count: payments.length,
      data: payments,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};