class NotificationService {
  async sendEmail({ to, subject, template, data }) {
    // Stub: integrate provider later (e.g., Nodemailer + SMTP)
    console.log(`[Email] to=${to} subject=${subject} template=${template}`, data);
    return true;
  }

  async sendSMS({ to, body }) {
    // Stub: integrate SMS provider later
    console.log(`[SMS] to=${to} body=${body}`);
    return true;
  }

  async createInAppNotification({ userId, type, title, message, data }) {
    // Stub: persistence to DB could be added (Notification model)
    console.log(`[InApp] user=${userId} type=${type} title=${title}`);
    return true;
  }

  async sendReservationConfirmation(reservation, user, commerce) {
    await this.sendEmail({
      to: user.email,
      subject: 'Confirmación de Reserva - Vértice',
      template: 'reservation-confirmation',
      data: {
        userName: user.personalInfo?.name || user.name,
        reservationId: reservation._id,
        pickupCode: reservation.pickupCode,
        pickupTime: reservation.pickupTime,
        commerceName: commerce?.commerceInfo?.businessName || commerce?.name
      }
    });

    if (user.personalInfo?.phone || user.phone) {
      await this.sendSMS({
        to: user.personalInfo?.phone || user.phone,
        body: `Reserva confirmada. Código: ${reservation.pickupCode}. Retiro: ${reservation.pickupTime || ''}`
      });
    }

    await this.createInAppNotification({
      userId: user._id,
      type: 'reservation_confirmed',
      title: 'Reserva Confirmada',
      message: `Tu reserva está lista. Código: ${reservation.pickupCode}`,
      data: { reservationId: reservation._id }
    });
  }
}

module.exports = new NotificationService();
