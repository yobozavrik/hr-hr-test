export const offerTemplate = (name: string, role: string) => ({
  subject: `Пропозиція про співпрацю: ${role}`,
  body: `Вітаємо, ${name}!\n\nМи раді запропонувати вам позицію ${role}. Деталі пропозиції знаходяться у прикріпленому файлі.`
});
