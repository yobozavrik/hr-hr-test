export class CalendarService {
  async getAvailableSlots(): Promise<string[]> {
    return ['10:00 AM', '02:00 PM', '04:30 PM'];
  }
}
