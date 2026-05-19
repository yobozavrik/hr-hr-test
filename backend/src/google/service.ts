import { google } from 'googleapis'
import type { PrismaClient } from '../generated/prisma'

export class GoogleService {
  private oauth2Client: any

  constructor(
    private db: PrismaClient,
    clientId: string,
    clientSecret: string,
    redirectUri: string,
  ) {
    this.oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri)
  }

  getAuthUrl(userId: string, scopes: string[]): string {
    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      state: userId,
      prompt: 'consent',
    })
  }

  async exchangeCode(code: string) {
    const { tokens } = await this.oauth2Client.getToken(code)
    return tokens
  }

  async saveTokens(userId: string, tokens: any) {
    return this.db.googleToken.upsert({
      where: { userId },
      create: {
        userId,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiresAt: new Date(Date.now() + (tokens.expiry_date || 3600 * 1000)),
        scope: tokens.scope || '',
      },
      update: {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token || undefined,
        expiresAt: new Date(Date.now() + (tokens.expiry_date || 3600 * 1000)),
        scope: tokens.scope || '',
      },
    })
  }

  async getTokens(userId: string) {
    return this.db.googleToken.findUnique({
      where: { userId },
    })
  }

  private async refreshAccessToken(userId: string) {
    const token = await this.getTokens(userId)
    if (!token) throw new Error('No Google tokens found')

    this.oauth2Client.setCredentials({
      refresh_token: token.refreshToken,
    })

    const { credentials } = await this.oauth2Client.refreshAccessToken()

    await this.saveTokens(userId, {
      access_token: credentials.access_token,
      refresh_token: token.refreshToken,
      expiry_date: credentials.expiry_date,
      scope: token.scope,
    })

    return credentials.access_token
  }

  // Google Calendar
  async createCalendarEvent(userId: string, event: {
    summary: string
    description?: string
    start: Date
    end: Date
  }) {
    const accessToken = await this.refreshAccessToken(userId)
    this.oauth2Client.setCredentials({ access_token: accessToken })

    const calendar = google.calendar({ version: 'v3', auth: this.oauth2Client })

    const response = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: {
        summary: event.summary,
        description: event.description,
        start: { dateTime: event.start.toISOString() },
        end: { dateTime: event.end.toISOString() },
      },
    })

    return response.data
  }

  async listCalendarEvents(userId: string, timeMin: Date, timeMax: Date) {
    const accessToken = await this.refreshAccessToken(userId)
    this.oauth2Client.setCredentials({ access_token: accessToken })

    const calendar = google.calendar({ version: 'v3', auth: this.oauth2Client })

    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: timeMin.toISOString(),
      timeMax: timeMax.toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
    })

    return response.data.items || []
  }

  // Google Sheets
  async createSpreadsheet(userId: string, title: string) {
    const accessToken = await this.refreshAccessToken(userId)
    this.oauth2Client.setCredentials({ access_token: accessToken })

    const sheets = google.sheets({ version: 'v4', auth: this.oauth2Client })

    const response = await sheets.spreadsheets.create({
      requestBody: {
        properties: { title },
      },
    })

    return response.data
  }

  async appendToSheet(userId: string, spreadsheetId: string, range: string, values: any[][]) {
    const accessToken = await this.refreshAccessToken(userId)
    this.oauth2Client.setCredentials({ access_token: accessToken })

    const sheets = google.sheets({ version: 'v4', auth: this.oauth2Client })

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range,
      valueInputOption: 'RAW',
      requestBody: { values },
    })
  }

  // Gmail
  async sendEmail(userId: string, to: string, subject: string, body: string) {
    const accessToken = await this.refreshAccessToken(userId)
    this.oauth2Client.setCredentials({ access_token: accessToken })

    const gmail = google.gmail({ version: 'v1', auth: this.oauth2Client })

    const message = [
      'Content-Type: text/plain; charset="UTF-8"\n',
      'MIME-Version: 1.0\n',
      `To: ${to}\n`,
      `Subject: ${subject}\n\n`,
      body,
    ].join('')

    const encodedMessage = Buffer.from(message).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')

    const response = await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedMessage,
      },
    })

    return response.data
  }

  async listEmails(userId: string, query?: string) {
    const accessToken = await this.refreshAccessToken(userId)
    this.oauth2Client.setCredentials({ access_token: accessToken })

    const gmail = google.gmail({ version: 'v1', auth: this.oauth2Client })

    const response = await gmail.users.messages.list({
      userId: 'me',
      q: query,
      maxResults: 20,
    })

    return response.data.messages || []
  }
}
