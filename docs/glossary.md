# Glossary

Key terms and concepts used in Omakase.

## A

**Agent**
: An autonomous AI worker with a specific role (explorer, task, reviewer, oracle) that can execute tools and make decisions.

**Auto-Failover**
: Automatic switching to a backup provider when the primary provider fails.

## C

**Circuit Breaker**
: A fault-tolerance pattern that prevents cascading failures by temporarily blocking requests to a failing provider. States: CLOSED (normal), OPEN (blocking), HALF_OPEN (testing).

**Chronos**
: The built-in background task scheduler supporting once, interval, delayed, and cron-based scheduling.

**Coordinator**
: The multi-agent orchestration system that manages agent execution in sequential, parallel, or adaptive modes.

## F

**Failover Chain**
: The ordered list of providers to try when the current provider fails. Default: Anthropic → OpenAI → Ollama → Nvidia.

## H

**Health Check**
: Periodic ping to providers (every 30s by default) to detect issues before user requests fail.

## M

**Message**
: A single turn in the conversation, either from user or assistant. Contains content, role, and optional tool calls/results.

**Multi-Agent**
: The capability to run multiple AI agents with different roles coordinating on complex tasks.

## O

**Omakase**
: Japanese concept meaning "I leave it up to you" - referring to the chef's choice. In this context, the AI makes decisions on your behalf.

## P

**Provider**
: An LLM API integration (Anthropic, OpenAI, Ollama, Nvidia). Each provider implements the LLMProvider interface.

**ProviderHealthManager**
: The system component that monitors provider health and manages automatic failover.

## Q

**QueryEngine**
: The core engine that processes LLM queries, handles retries, and manages tool execution loops.

## R

**Resilience**
: The system's ability to handle failures gracefully through circuit breakers, retries, and failover.

**RuntimeContext**
: Shared context containing providers, tools, and state accessible to all agents.

## S

**Session**
: A single interactive conversation with Omakase, including messages, settings, and execution state.

## T

**Tool**
: A capability that the AI can invoke (Bash, FileRead, FileWrite, Glob, Grep, TodoWrite, AskUser, Config, Memory).

**Tool Context**
: The execution context passed to tools, containing session info, settings, and runtime state.

## W

**Workflow**
: A predefined sequence of operations. In Omakase, this usually refers to GitHub Actions workflows.
