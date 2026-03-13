#!/usr/bin/env node
/**
 * Linear API helper: close an issue by identifier, or create a new issue.
 * Uses LINEAR_API_KEY from .env (repo root). .env is gitignored.
 *
 * Usage:
 *   node scripts/linear.js close TT-5
 *   node scripts/linear.js start TT-14
 *   node scripts/linear.js create "Title here" "Optional description"
 *
 * For create, the new issue is added to the same team as TT-5 (Tiny Tree).
 */

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const LINEAR_API = 'https://api.linear.app/graphql';
const KEY = (process.env.LINEAR_API_KEY || '').trim().replace(/^["']|["']$/g, '');

if (!KEY) {
  console.error('Missing LINEAR_API_KEY in .env (repo root). Add: LINEAR_API_KEY=lin_api_...');
  process.exit(1);
}

const headers = {
  'Content-Type': 'application/json',
  Authorization: KEY,
};

async function graphql(query, variables = {}) {
  const res = await fetch(LINEAR_API, {
    method: 'POST',
    headers,
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json();
  if (json.errors) {
    const msg = json.errors.map((e) => e.message).join('; ');
    if (msg.toLowerCase().includes('authentic')) {
      throw new Error(
        msg + ' — Check LINEAR_API_KEY in .env: no quotes, no spaces, value like lin_api_...'
      );
    }
    throw new Error(msg);
  }
  return json.data;
}

// Parse "TT-5" into team key "TT" and number 5
function parseIdentifier(identifier) {
  const match = String(identifier).match(/^([A-Za-z]+)-(\d+)$/);
  if (!match) throw new Error('Identifier must be like TT-5 (teamKey-number)');
  return { teamKey: match[1].toUpperCase(), number: parseInt(match[2], 10) };
}

async function getIssueAndTeam(identifier) {
  const { teamKey, number } = parseIdentifier(identifier);
  // IssueFilter uses team.id and number (not identifier)
  const teamsData = await graphql(
    `
    query GetTeam($key: String!) {
      teams(filter: { key: { eq: $key } }, first: 1) {
        nodes { id name key states { nodes { id name } } }
      }
    }
    `,
    { key: teamKey }
  );
  const team = teamsData?.teams?.nodes?.[0];
  if (!team) throw new Error(`Team ${teamKey} not found`);

  const issuesData = await graphql(
    `
    query GetIssue($teamId: ID!, $number: Float!) {
      issues(filter: { team: { id: { eq: $teamId } }, number: { eq: $number } }, first: 1) {
        nodes {
          id
          identifier
          title
          team { id name states { nodes { id name } } }
        }
      }
    }
    `,
    { teamId: team.id, number: Number(number) }
  );
  const issue = issuesData?.issues?.nodes?.[0];
  if (!issue) throw new Error(`Issue ${identifier} not found`);
  // Normalize: team.states might be on the team we already fetched
  if (!issue.team.states?.nodes?.length && team.states?.nodes?.length)
    issue.team.states = team.states;
  return issue;
}

async function setIssueState(identifier, stateNames) {
  const issue = await getIssueAndTeam(identifier);
  const names = stateNames.map((n) => n.toLowerCase());
  const state = issue.team?.states?.nodes?.find((s) =>
    names.includes(s.name.toLowerCase())
  );
  if (!state)
    throw new Error(
      'Could not find state (' + stateNames.join(' or ') + ') on team ' + (issue.team?.name || '?')
    );

  await graphql(
    `
    mutation IssueUpdate($id: String!, $stateId: String!) {
      issueUpdate(id: $id, input: { stateId: $stateId }) {
        success
        issue { identifier title state { name } }
      }
    }
    `,
    { id: issue.id, stateId: state.id }
  );
  console.log(`${issue.identifier}: ${issue.title} → ${state.name}`);
}

async function closeIssue(identifier) {
  await setIssueState(identifier, ['Done', 'Completed']);
}

async function startIssue(identifier) {
  await setIssueState(identifier, ['In Progress', 'In progress', 'Started']);
}

async function createIssue(title, description = '') {
  const issue = await getIssueAndTeam('TT-5');
  const teamId = issue.team?.id;
  if (!teamId) throw new Error('Could not determine team from TT-5');

  const data = await graphql(
    `
    mutation IssueCreate($teamId: String!, $title: String!, $description: String) {
      issueCreate(input: { teamId: $teamId, title: $title, description: $description }) {
        success
        issue { identifier title url }
      }
    }
    `,
    { teamId, title, description }
  );
  const created = data?.issueCreate?.issue;
  if (!created) throw new Error('Create failed');
  console.log(`Created ${created.identifier}: ${created.title}`);
  console.log(created.url);
}

async function main() {
  const [cmd, ...args] = process.argv.slice(2);
  try {
    if (cmd === 'close' && args[0]) {
      await closeIssue(args[0].toUpperCase());
    } else if (cmd === 'start' && args[0]) {
      await startIssue(args[0].toUpperCase());
    } else if (cmd === 'create' && args[0]) {
      await createIssue(args[0], args[1] || '');
    } else {
      console.log('Usage: node scripts/linear.js close TT-5');
      console.log('       node scripts/linear.js start TT-14');
      console.log('       node scripts/linear.js create "Title" "Optional description"');
      process.exit(1);
    }
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
}

main();
