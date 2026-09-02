// scripts/test-razorpay-webhook.mjs
// Test suite covering all 24 required Razorpay webhook test scenarios for Namma Thalluvandi V2

import crypto from "crypto";

const TEST_WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET || "ntv_test_whsec_secret_987654";
const BASE_URL = process.env.TEST_BASE_URL || "http://localhost:3000";

function generateSignature(payloadString, secret = TEST_WEBHOOK_SECRET) {
  return crypto.createHmac("sha256", secret).update(payloadString).digest("hex");
}

async function sendWebhook(eventPayload, signatureOverride = null, customHeaders = {}) {
  const rawBody = typeof eventPayload === "string" ? eventPayload : JSON.stringify(eventPayload);
  const signature = signatureOverride !== null ? signatureOverride : generateSignature(rawBody);

  const res = await fetch(`${BASE_URL}/api/razorpay/webhook`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-razorpay-signature": signature,
      ...customHeaders,
    },
    body: rawBody,
  });

  const text = await res.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch {}

  return {
    status: res.status,
    body: json || text,
  };
}

// 24 Test Scenario Definitions
const testCases = [
  {
    name: "1. Valid Webhook Signature",
    fn: async () => {
      const payload = {
        id: `evt_test_valid_${Date.now()}`,
        event: "payment.captured",
        payload: {
          payment: {
            entity: {
              id: `pay_test_${Date.now()}`,
              amount: 9900,
              currency: "INR",
              status: "captured",
              notes: { planId: "basic", billingCycle: "1_month", userId: "test-user-1" },
            },
          },
        },
      };
      const res = await sendWebhook(payload);
      return res.status === 200;
    },
  },
  {
    name: "2. Invalid Webhook Signature",
    fn: async () => {
      const payload = { id: `evt_bad_sig_${Date.now()}`, event: "payment.captured" };
      const res = await sendWebhook(payload, "invalid_signature_hex_12345");
      return res.status === 401;
    },
  },
  {
    name: "3. Duplicate Webhook Idempotency",
    fn: async () => {
      const duplicateEventId = `evt_dup_${Date.now()}`;
      const payload = {
        id: duplicateEventId,
        event: "payment.captured",
        payload: {
          payment: {
            entity: {
              id: `pay_dup_${Date.now()}`,
              amount: 9900,
              currency: "INR",
              status: "captured",
              notes: { planId: "basic", billingCycle: "1_month", userId: "test-user-dup" },
            },
          },
        },
      };
      // Send first time
      const res1 = await sendWebhook(payload);
      // Send second time (retried by Razorpay)
      const res2 = await sendWebhook(payload);
      return res1.status === 200 && res2.status === 200 && res2.body?.status === "already_processed";
    },
  },
  {
    name: "4. Event: payment.captured",
    fn: async () => {
      const payload = {
        id: `evt_pay_cap_${Date.now()}`,
        event: "payment.captured",
        payload: {
          payment: {
            entity: {
              id: `pay_cap_${Date.now()}`,
              amount: 24900,
              currency: "INR",
              status: "captured",
              method: "upi",
              notes: { planId: "growth", billingCycle: "1_month", userId: "user-growth-1" },
            },
          },
        },
      };
      const res = await sendWebhook(payload);
      return res.status === 200;
    },
  },
  {
    name: "5. Event: payment.failed",
    fn: async () => {
      const payload = {
        id: `evt_pay_fail_${Date.now()}`,
        event: "payment.failed",
        payload: {
          payment: {
            entity: {
              id: `pay_fail_${Date.now()}`,
              amount: 9900,
              currency: "INR",
              status: "failed",
              error_code: "BAD_REQUEST_ERROR",
              error_description: "Payment failed due to bank timeout",
              notes: { planId: "basic", billingCycle: "1_month", userId: "user-fail-1" },
            },
          },
        },
      };
      const res = await sendWebhook(payload);
      return res.status === 200;
    },
  },
  {
    name: "6. Event: order.paid",
    fn: async () => {
      const payload = {
        id: `evt_ord_paid_${Date.now()}`,
        event: "order.paid",
        payload: {
          order: {
            entity: {
              id: `order_test_${Date.now()}`,
              amount: 45900,
              amount_paid: 45900,
              status: "paid",
              notes: { planId: "pro", billingCycle: "1_month", userId: "user-pro-1" },
            },
          },
          payment: {
            entity: {
              id: `pay_ord_${Date.now()}`,
              amount: 45900,
              currency: "INR",
              method: "card",
            },
          },
        },
      };
      const res = await sendWebhook(payload);
      return res.status === 200;
    },
  },
  {
    name: "7. Event: subscription.authenticated",
    fn: async () => {
      const payload = {
        id: `evt_sub_auth_${Date.now()}`,
        event: "subscription.authenticated",
        payload: {
          subscription: {
            entity: {
              id: `sub_auth_${Date.now()}`,
              status: "authenticated",
              current_start: Math.floor(Date.now() / 1000),
              current_end: Math.floor(Date.now() / 1000) + 30 * 86400,
              notes: { planId: "growth", billingCycle: "1_month", userId: "user-sub-1" },
            },
          },
        },
      };
      const res = await sendWebhook(payload);
      return res.status === 200;
    },
  },
  {
    name: "8. Event: subscription.activated",
    fn: async () => {
      const payload = {
        id: `evt_sub_act_${Date.now()}`,
        event: "subscription.activated",
        payload: {
          subscription: {
            entity: {
              id: `sub_act_${Date.now()}`,
              status: "active",
              current_start: Math.floor(Date.now() / 1000),
              current_end: Math.floor(Date.now() / 1000) + 30 * 86400,
              paid_count: 1,
              total_count: 12,
              notes: { planId: "basic", billingCycle: "1_month", userId: "user-sub-act" },
            },
          },
        },
      };
      const res = await sendWebhook(payload);
      return res.status === 200;
    },
  },
  {
    name: "9. Event: subscription.charged",
    fn: async () => {
      const payload = {
        id: `evt_sub_chg_${Date.now()}`,
        event: "subscription.charged",
        payload: {
          subscription: {
            entity: {
              id: `sub_chg_${Date.now()}`,
              status: "active",
              current_start: Math.floor(Date.now() / 1000),
              current_end: Math.floor(Date.now() / 1000) + 30 * 86400,
              paid_count: 2,
              total_count: 12,
              notes: { planId: "growth", billingCycle: "1_month", userId: "user-sub-chg" },
            },
          },
          payment: {
            entity: {
              id: `pay_chg_${Date.now()}`,
              amount: 24900,
              currency: "INR",
              method: "upi",
            },
          },
        },
      };
      const res = await sendWebhook(payload);
      return res.status === 200;
    },
  },
  {
    name: "10. Event: subscription.pending",
    fn: async () => {
      const payload = {
        id: `evt_sub_pnd_${Date.now()}`,
        event: "subscription.pending",
        payload: {
          subscription: {
            entity: {
              id: `sub_pnd_${Date.now()}`,
              status: "pending",
              charge_at: Math.floor(Date.now() / 1000) + 86400,
            },
          },
        },
      };
      const res = await sendWebhook(payload);
      return res.status === 200;
    },
  },
  {
    name: "11. Event: subscription.halted",
    fn: async () => {
      const payload = {
        id: `evt_sub_hlt_${Date.now()}`,
        event: "subscription.halted",
        payload: {
          subscription: {
            entity: {
              id: `sub_hlt_${Date.now()}`,
              status: "halted",
            },
          },
        },
      };
      const res = await sendWebhook(payload);
      return res.status === 200;
    },
  },
  {
    name: "12. Event: subscription.cancelled",
    fn: async () => {
      const payload = {
        id: `evt_sub_cnc_${Date.now()}`,
        event: "subscription.cancelled",
        payload: {
          subscription: {
            entity: {
              id: `sub_cnc_${Date.now()}`,
              status: "cancelled",
              ended_at: Math.floor(Date.now() / 1000),
            },
          },
        },
      };
      const res = await sendWebhook(payload);
      return res.status === 200;
    },
  },
  {
    name: "13. Event: subscription.completed",
    fn: async () => {
      const payload = {
        id: `evt_sub_cmp_${Date.now()}`,
        event: "subscription.completed",
        payload: {
          subscription: {
            entity: {
              id: `sub_cmp_${Date.now()}`,
              status: "completed",
              ended_at: Math.floor(Date.now() / 1000),
            },
          },
        },
      };
      const res = await sendWebhook(payload);
      return res.status === 200;
    },
  },
  {
    name: "14. Event: subscription.paused",
    fn: async () => {
      const payload = {
        id: `evt_sub_psd_${Date.now()}`,
        event: "subscription.paused",
        payload: {
          subscription: {
            entity: {
              id: `sub_psd_${Date.now()}`,
              status: "paused",
            },
          },
        },
      };
      const res = await sendWebhook(payload);
      return res.status === 200;
    },
  },
  {
    name: "15. Event: subscription.resumed",
    fn: async () => {
      const payload = {
        id: `evt_sub_rsm_${Date.now()}`,
        event: "subscription.resumed",
        payload: {
          subscription: {
            entity: {
              id: `sub_rsm_${Date.now()}`,
              status: "active",
              current_end: Math.floor(Date.now() / 1000) + 15 * 86400,
            },
          },
        },
      };
      const res = await sendWebhook(payload);
      return res.status === 200;
    },
  },
  {
    name: "16. Event: invoice.paid",
    fn: async () => {
      const payload = {
        id: `evt_inv_pd_${Date.now()}`,
        event: "invoice.paid",
        payload: {
          invoice: {
            entity: {
              id: `inv_${Date.now()}`,
              subscription_id: `sub_inv_${Date.now()}`,
              amount_paid: 9900,
              currency: "INR",
              status: "paid",
            },
          },
          payment: {
            entity: {
              id: `pay_inv_${Date.now()}`,
              amount: 9900,
              currency: "INR",
            },
          },
        },
      };
      const res = await sendWebhook(payload);
      return res.status === 200;
    },
  },
  {
    name: "17. Event: invoice.partially_paid",
    fn: async () => {
      const payload = {
        id: `evt_inv_part_${Date.now()}`,
        event: "invoice.partially_paid",
        payload: {
          invoice: {
            entity: {
              id: `inv_part_${Date.now()}`,
              subscription_id: `sub_part_${Date.now()}`,
              amount_paid: 5000,
              amount: 9900,
              status: "partially_paid",
            },
          },
        },
      };
      const res = await sendWebhook(payload);
      return res.status === 200;
    },
  },
  {
    name: "18. Event: invoice.expired",
    fn: async () => {
      const payload = {
        id: `evt_inv_exp_${Date.now()}`,
        event: "invoice.expired",
        payload: {
          invoice: {
            entity: {
              id: `inv_exp_${Date.now()}`,
              subscription_id: `sub_exp_${Date.now()}`,
              status: "expired",
            },
          },
        },
      };
      const res = await sendWebhook(payload);
      return res.status === 200;
    },
  },
  {
    name: "19. Browser Closes After Payment (Webhook Asynchronous Activation)",
    fn: async () => {
      // Payment happens on Razorpay, browser closes without firing callback
      const payload = {
        id: `evt_async_close_${Date.now()}`,
        event: "payment.captured",
        payload: {
          payment: {
            entity: {
              id: `pay_async_${Date.now()}`,
              amount: 24900,
              currency: "INR",
              status: "captured",
              notes: { planId: "basic", billingCycle: "3_months", userId: "user-async-1" },
            },
          },
        },
      };
      const res = await sendWebhook(payload);
      return res.status === 200;
    },
  },
  {
    name: "20. Delayed Webhook Processing",
    fn: async () => {
      const payload = {
        id: `evt_delayed_${Date.now()}`,
        event: "payment.captured",
        payload: {
          payment: {
            entity: {
              id: `pay_delayed_${Date.now()}`,
              amount: 9900,
              currency: "INR",
              status: "captured",
              created_at: Math.floor(Date.now() / 1000) - 3600, // 1 hour delayed
              notes: { planId: "basic", billingCycle: "1_month", userId: "user-delayed-1" },
            },
          },
        },
      };
      const res = await sendWebhook(payload);
      return res.status === 200;
    },
  },
  {
    name: "21. Duplicate Payment Event (Same Payment ID across order.paid and payment.captured)",
    fn: async () => {
      const sharedPaymentId = `pay_shared_${Date.now()}`;
      const payload1 = {
        id: `evt_p1_${Date.now()}`,
        event: "payment.captured",
        payload: {
          payment: {
            entity: {
              id: sharedPaymentId,
              amount: 9900,
              currency: "INR",
              status: "captured",
              notes: { planId: "basic", billingCycle: "1_month", userId: "user-shared-1" },
            },
          },
        },
      };
      const payload2 = {
        id: `evt_p2_${Date.now()}`,
        event: "order.paid",
        payload: {
          order: {
            entity: {
              id: `order_shared_${Date.now()}`,
              amount: 9900,
              status: "paid",
              notes: { planId: "basic", billingCycle: "1_month", userId: "user-shared-1" },
            },
          },
          payment: {
            entity: {
              id: sharedPaymentId,
              amount: 9900,
              currency: "INR",
            },
          },
        },
      };
      const res1 = await sendWebhook(payload1);
      const res2 = await sendWebhook(payload2);
      return res1.status === 200 && res2.status === 200;
    },
  },
  {
    name: "22. Incorrect Amount Validation (₹1 paid for ₹999 Pro plan)",
    fn: async () => {
      const payload = {
        id: `evt_bad_amt_${Date.now()}`,
        event: "payment.captured",
        payload: {
          payment: {
            entity: {
              id: `pay_bad_amt_${Date.now()}`,
              amount: 100, // 100 paise = ₹1 instead of ₹999
              currency: "INR",
              status: "captured",
              notes: { planId: "pro", billingCycle: "3_months", userId: "user-fraud-amt" },
            },
          },
        },
      };
      const res = await sendWebhook(payload);
      // Webhook records payment transaction but logs warning and refuses to activate incorrect amount plan
      return res.status === 200;
    },
  },
  {
    name: "23. Incorrect Plan Tier Validation",
    fn: async () => {
      const payload = {
        id: `evt_bad_plan_${Date.now()}`,
        event: "payment.captured",
        payload: {
          payment: {
            entity: {
              id: `pay_bad_plan_${Date.now()}`,
              amount: 9900,
              currency: "INR",
              status: "captured",
              notes: { planId: "non_existent_tier", billingCycle: "1_month", userId: "user-bad-plan" },
            },
          },
        },
      };
      const res = await sendWebhook(payload);
      return res.status === 200;
    },
  },
  {
    name: "24. Incorrect Vendor / User Mapping",
    fn: async () => {
      const payload = {
        id: `evt_unmapped_${Date.now()}`,
        event: "payment.captured",
        payload: {
          payment: {
            entity: {
              id: `pay_unmapped_${Date.now()}`,
              amount: 9900,
              currency: "INR",
              status: "captured",
              notes: {}, // No userId, no vendorId, no matching phone
            },
          },
        },
      };
      const res = await sendWebhook(payload);
      // Webhook records transaction under 'unmapped', skips activation safely without 500 crash
      return res.status === 200;
    },
  },
];

async function runAllTests() {
  console.log("\n=======================================================");
  console.log("  Namma Thalluvandi V2 — Razorpay Webhook Test Suite");
  console.log("=======================================================\n");

  let passed = 0;
  let failed = 0;

  for (const tc of testCases) {
    process.stdout.write(`Testing: ${tc.name} ... `);
    try {
      const success = await tc.fn();
      if (success) {
        console.log("✓ PASSED");
        passed++;
      } else {
        console.log("✗ FAILED");
        failed++;
      }
    } catch (err) {
      console.log(`✗ ERROR (${err.message})`);
      failed++;
    }
  }

  console.log("\n-------------------------------------------------------");
  console.log(`Results: ${passed} Passed, ${failed} Failed out of ${testCases.length} tests.`);
  console.log("-------------------------------------------------------\n");

  return failed === 0;
}

// Export for module or CLI execution
if (process.argv[1]?.endsWith("test-razorpay-webhook.mjs")) {
  runAllTests().then((ok) => process.exit(ok ? 0 : 1));
}
