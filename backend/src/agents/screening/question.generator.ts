export class QuestionGenerator {
  generate(candidateName: string, skills: string[]): string[] {
    return [
      `Розкажіть про ваш досвід роботи з ${skills.slice(0, 2).join(', ')}.`,
      `Які були найбільші виклики у ваших попередніх проектах?`,
      `Чому ви розглядаєте зміну місця роботи зараз?`
    ];
  }
}
