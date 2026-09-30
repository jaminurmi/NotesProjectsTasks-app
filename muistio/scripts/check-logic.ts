import assert from "node:assert/strict";
import { plainText } from "../src/text.ts";
import { matchesFilter, taskStatus } from "../src/taskStatus.ts";

const base = {
  completed: false,
  startDate: "2026-10-01",
  endDate: "2026-10-05",
  deadline: null as string | null,
};

assert.equal(taskStatus({ ...base, completed: true, deadline: "2026-09-01" }, "2026-10-03"), "done");
assert.equal(taskStatus(base, "2026-10-03"), "active");
assert.equal(taskStatus(base, "2026-10-01"), "active");
assert.equal(taskStatus(base, "2026-10-05"), "active");
assert.equal(taskStatus(base, "2026-09-30"), "upcoming");
assert.equal(taskStatus({ ...base, deadline: "2026-10-02" }, "2026-10-03"), "overdue");
assert.equal(taskStatus({ ...base, endDate: "2026-09-28" }, "2026-10-03"), "overdue");
assert.equal(
  taskStatus({ ...base, endDate: "2026-09-28", deadline: "2026-10-10" }, "2026-10-03"),
  "ended",
);
assert.equal(
  taskStatus({ ...base, startDate: "2026-10-08", deadline: "2026-09-01" }, "2026-10-03"),
  "overdue",
);
assert.equal(matchesFilter("active", "active"), true);
assert.equal(matchesFilter("ended", "overdue"), false);
assert.equal(matchesFilter("ended", "all"), true);
assert.equal(plainText("<h1>Otsikko</h1><p>Teksti &amp; lista</p>"), "Otsikko Teksti & lista");

console.log("checks ok");
