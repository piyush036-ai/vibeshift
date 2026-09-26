/**
 * Project DNA Extractor
 * Learns repository conventions from ARCHITECTURE.md, CONTRIBUTING.md, and approved PRs.
 * In production: uses IBM Bob to parse and embed repo documents into a structured rule graph.
 */

import type { ProjectDNA, DNARule } from "@/lib/types";
import { MOCK_PROJECT_DNA } from "@/mock-data";

export interface DNAExtractionInput {
  repositoryId: string;
  architectureMd?: string;
  contributingMd?: string;
  approvedPRPatterns?: string[];
}

/**
 * Extracts Project DNA from repository documentation.
 * Returns a structured rule set used by all subagents.
 */
export async function extractProjectDNA(
  input: DNAExtractionInput
): Promise<ProjectDNA> {
  // Production: IBM Bob reads ARCHITECTURE.md + CONTRIBUTING.md
  // and uses Granite to extract structured rules + examples.
  // Demo: return mock DNA for the demo repository.
  return {
    ...MOCK_PROJECT_DNA,
    repositoryId: input.repositoryId,
    extractedAt: new Date().toISOString(),
  };
}

/**
 * Returns rules as a flat string list for subagent prompts.
 */
export function dnaToPromptContext(dna: ProjectDNA): string {
  return dna.rules
    .map((r) => `[${r.severity.toUpperCase()}] ${r.rule}: ${r.description}`)
    .join("\n");
}

export function getRuleById(dna: ProjectDNA, ruleId: string): DNARule | undefined {
  return dna.rules.find((r) => r.id === ruleId);
}

