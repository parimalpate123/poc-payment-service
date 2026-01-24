# POC Payment Service

This is a POC (Proof of Concept) repository for testing auto-remediation capabilities.

## Purpose

This service simulates a payment processing service that can experience various issues:
- Database connection timeouts
- External payment gateway failures
- Invalid payment method handling
- Service unavailability

## Structure

```
poc-payment-service/
├── src/
│   └── index.js      # Main service code
├── package.json      # Dependencies
└── README.md         # This file
```

## Running

```bash
npm install
npm start
```

## Endpoints

- `POST /api/v1/payments` - Process a payment
- `GET /api/v1/payments/:paymentId` - Get payment status
- `GET /health` - Health check

## Auto-Remediation

This repository is used to test automated incident remediation:
1. When incidents are detected, GitHub issues are created here
2. Issue Agent analyzes the code and proposes fixes
3. PR Review Agent reviews and approves fixes
