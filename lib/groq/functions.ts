/**
 * Groq Function Definitions
 *
 * Defines alle functions som Groq kan kalle for å hente pasientdata.
 * Disse sendes til Groq API som "tools" i request.
 */

import type { GroqFunction } from "./types";

export const groqFunctions: GroqFunction[] = [
  {
    name: "get_prescriptions",
    description:
      "Henter pasientens aktive medisiner og resepter. Brukes når pasienten spør om medisiner, resepter, eller hva de skal ta.",
    parameters: {
      type: "object",
      properties: {},
      required: [],
    },
  },
  {
    name: "get_reminders",
    description:
      "Henter kommende påminnelser for pasienten. Brukes når pasienten spør om påminnelser, når de skal ta medisin, eller fremtidige avtaler.",
    parameters: {
      type: "object",
      properties: {},
      required: [],
    },
  },
  {
    name: "get_health_records",
    description:
      "Henter pasientens siste vitale målinger (blodtrykk, puls, blodsukker, temperatur). Brukes når pasienten spør om helsestatus eller vitale parametere.",
    parameters: {
      type: "object",
      properties: {},
      required: [],
    },
  },
  {
    name: "get_todays_schedule",
    description:
      "Henter dagens medisiner og påminnelser samlet. Brukes når pasienten spør om dagens plan eller hva de skal gjøre i dag.",
    parameters: {
      type: "object",
      properties: {},
      required: [],
    },
  },
  {
    name: "get_doctors",
    description:
      "Henter informasjon om pasientens leger (primær lege og leger fra resepter). Brukes når pasienten spør om legen sin eller kontaktinformasjon.",
    parameters: {
      type: "object",
      properties: {},
      required: [],
    },
  },
];

/**
 * Konverterer function definitions til Groq tools-format
 */
export function getFunctionDefinitions() {
  return groqFunctions.map((func) => ({
    type: "function" as const,
    function: {
      name: func.name,
      description: func.description,
      parameters: func.parameters,
    },
  }));
}
