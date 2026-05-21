---
title: "The Costs of Oversolving: A System Retrospective"
description: "Reflecting on a system design that over-indexed on hypothetical multi-region scale at the cost of immediate operability, developer velocity, and budget."
date: 2026-04-18
category: "architecture"
tags: ["posts", "architecture"]
layout: layouts/post.njk
templateEngineOverride: md
---

As software engineers, we are trained to design systems that scale. We read posts about high-availability setups, multi-region failovers, and active-active datastores, and we naturally want to bring those patterns into our own projects.

But there is a dangerous trap here. Designing for scale that you *might* need in three years—but do not need today—carries a heavy, often compounding cost. In this post, I want to conduct a transparent retrospective on a system I designed that over-indexed on hypothetical scale, and dissect the hidden costs of over-engineering.

## The Architecture Dream

The requirements were simple: build a customer ingestion portal for a mid-sized B2B application. On day one, we expected around 50 concurrent users and less than 1,000 document uploads per day.

Instead of writing a simple, containerized monolith backed by a single relational database (which would have taken three weeks to ship), I dreamed of a highly available, modular, multi-region architecture:

* **Microservices**: Six microservices communicating asynchronously via AWS SQS.
* **Global Database**: Amazon DynamoDB with global tables replicated across US-East-1 and EU-West-1.
* **Storage**: Amazon S3 with cross-region replication.
* **Compute**: Kubernetes (EKS) cluster on day one, fully managed by Terraform.

It felt like a masterpiece. The architectural diagrams looked amazing.

## The Reality Check

We successfully built and deployed it, but the friction began almost immediately. What should have been a straightforward feature addition turned into a complex chore.

### Cost 1: Developer Velocity
To add a new input field on the portal form, we had to:
1. Update the frontend contract.
2. Modify three separate microservice repositories.
3. Update the SQS message schemas.
4. Deploy the services sequentially in our staging environment.

A change that would take 15 minutes in a modular monolith took three days of coordination, schema mapping, and deployment synchronizations.

### Cost 2: Debugging and Operational Cognitive Load
When a document upload failed, we couldn't just check a single logs console. We had to:
1. Locate the correlation ID.
2. Query AWS CloudWatch across six microservices.
3. Trace the message as it entered the dead-letter queue.
4. Diagnose distributed state issues.

Our operational overhead exploded. We spent more time managing cluster configurations, checking replica lags, and tuning SQS visibility timeouts than writing actual business value.

### Cost 3: Financial Overhead
Before we had even onboarded our first customer, our monthly AWS bill for staging and production EKS clusters, database replications, NAT gateways, and SQS endpoints exceeded $4,500.

## The Pivot

Six months after launch, with active user counts growing steadily but still well within a single VM's capabilities, we made the painful but necessary decision to **consolidate**.

We merged the six repositories into a modular Node.js monolith, replaced SQS with simple in-process task queues, migrated DynamoDB global tables to a standard Postgres instance, and moved from EKS to standard elastic container runtimes.

The results:
* **Lines of code**: Reduced by 42%.
* **Build/deploy times**: Dropped from 18 minutes to 90 seconds.
* **Monthly hosting cost**: Fell from $4,500 to $220.
* **Features delivered**: Increased threefold in the following quarter.

## Key Learnings

1. **Defer complexity until it hurts**: It is far easier to decompose a clean, modular monolith into microservices when you have structural patterns in place than it is to merge six messy microservices back together.
2. **Build for today's numbers, design for tomorrow's**: Keep your infrastructure simple, but ensure your code separates concerns logically (e.g. clean boundaries between features). If you must scale later, your database structures and interface boundaries will make it straightforward to split, without carrying the cognitive weight of high-scale setups prematurely.
