# Victoria Holiday & Pricing Calendar 2026–2028

> Source: Victoria State Government Education and Training term dates calendar.
> For use with dynamic pricing strategy — pass relevant sections to Claude when implementing date-based pricing logic.

---

## Pricing Tier Reference

| Tier | Description | Suggested Multiplier |
|------|-------------|----------------------|
| `PUBLIC_HOLIDAY` | Victorian public holidays | Highest |
| `SCHOOL_HOLIDAY` | School term break periods | High |
| `STANDARD` | School term (normal) days | Base rate |

> **Priority rule:** When a public holiday falls within a school holiday period, apply `PUBLIC_HOLIDAY` tier.
> **Summer peak:** The December–January summer break (~6 weeks) combines school holidays + Christmas + New Year and warrants its own sub-tier within `SCHOOL_HOLIDAY`.

---

## 1. Public Holidays

### 2026

| Date | Day | Holiday |
|------|-----|---------|
| 1 Jan 2026 | Thursday | New Year's Day |
| 26 Jan 2026 | Monday | Australia Day |
| 9 Mar 2026 | Monday | Labour Day |
| 3 Apr 2026 | Friday | Good Friday |
| 5 Apr 2026 | Sunday | Easter Sunday |
| 6 Apr 2026 | Monday | Easter Monday |
| 25 Apr 2026 | Saturday | ANZAC Day |
| 8 Jun 2026 | Monday | Queen's Birthday |
| 25 Sep 2026 | Friday | Friday before AFL Grand Final |
| 3 Nov 2026 | Tuesday | Melbourne Cup Day |
| 25 Dec 2026 | Friday | Christmas Day |
| 26 Dec 2026 | Saturday | Boxing Day |
| 31 Dec 2026 | Thursday | New Year's Eve |

### 2027

| Date | Day | Holiday |
|------|-----|---------|
| 1 Jan 2027 | Friday | New Year's Day |
| 26 Jan 2027 | Tuesday | Australia Day |
| 8 Mar 2027 | Monday | Labour Day |
| 26 Mar 2027 | Friday | Good Friday |
| 28 Mar 2027 | Sunday | Easter Sunday |
| 29 Mar 2027 | Monday | Easter Monday |
| 25 Apr 2027 | Sunday | ANZAC Day |
| 14 Jun 2027 | Monday | Queen's Birthday |
| 24 Sep 2027 | Friday | Friday before AFL Grand Final |
| 2 Nov 2027 | Tuesday | Melbourne Cup Day |
| 25 Dec 2027 | Saturday | Christmas Day |
| 26 Dec 2027 | Sunday | Boxing Day |
| 31 Dec 2027 | Friday | New Year's Eve |

### 2028

| Date | Day | Holiday |
|------|-----|---------|
| 1 Jan 2028 | Saturday | New Year's Day |
| 26 Jan 2028 | Wednesday | Australia Day |
| 13 Mar 2028 | Monday | Labour Day |
| 14 Apr 2028 | Friday | Good Friday |
| 16 Apr 2028 | Sunday | Easter Sunday |
| 17 Apr 2028 | Monday | Easter Monday |
| 25 Apr 2028 | Tuesday | ANZAC Day |
| 12 Jun 2028 | Monday | Queen's Birthday |
| 29 Sep 2028 | Friday | Friday before AFL Grand Final |
| 7 Nov 2028 | Tuesday | Melbourne Cup Day |
| 25 Dec 2028 | Monday | Christmas Day |
| 26 Dec 2028 | Tuesday | Boxing Day |
| 31 Dec 2028 | Sunday | New Year's Eve |

---

## 2. School Holiday Periods

> Dates represent the break between school terms. Public holidays within these windows retain the `PUBLIC_HOLIDAY` tier.

### 2026

| Break | From | To | Duration |
|-------|------|----|----------|
| Term 1 break | 3 Apr 2026 | 19 Apr 2026 | ~2.5 weeks |
| Term 2 break | 27 Jun 2026 | 12 Jul 2026 | ~2 weeks |
| Term 3 break | 19 Sep 2026 | 4 Oct 2026 | ~2 weeks |
| Summer break ⭐ | 19 Dec 2026 | ~26 Jan 2027 | ~6 weeks |

### 2027

| Break | From | To | Duration |
|-------|------|----|----------|
| Term 1 break | 26 Mar 2027 | 11 Apr 2027 | ~2.5 weeks |
| Term 2 break | 26 Jun 2027 | 11 Jul 2027 | ~2 weeks |
| Term 3 break | 18 Sep 2027 | 3 Oct 2027 | ~2 weeks |
| Summer break ⭐ | 18 Dec 2027 | ~26 Jan 2028 | ~6 weeks |

### 2028

| Break | From | To | Duration |
|-------|------|----|----------|
| Term 1 break | 1 Apr 2028 | 17 Apr 2028 | ~2.5 weeks |
| Term 2 break | 1 Jul 2028 | 16 Jul 2028 | ~2 weeks |
| Term 3 break | 23 Sep 2028 | 8 Oct 2028 | ~2 weeks |
| Summer break ⭐ | 22 Dec 2028 | ~26 Jan 2029 | ~6 weeks |

> ⭐ Summer break = peak-of-peaks. Consider a dedicated `SUMMER_PEAK` sub-tier.

---

## 3. Normal Days (School Term Periods)

> Standard operating school term dates — base rate / off-peak windows for family holiday bookings.

### 2026

| Term | From | To |
|------|------|----|
| Term 1 | 27 Jan 2026 | 2 Apr 2026 |
| Term 2 | 20 Apr 2026 | 26 Jun 2026 |
| Term 3 | 13 Jul 2026 | 18 Sep 2026 |
| Term 4 | 5 Oct 2026 | 18 Dec 2026 |

### 2027

| Term | From | To |
|------|------|----|
| Term 1 | 27 Jan 2027 | 25 Mar 2027 |
| Term 2 | 12 Apr 2027 | 25 Jun 2027 |
| Term 3 | 12 Jul 2027 | 17 Sep 2027 |
| Term 4 | 4 Oct 2027 | 17 Dec 2027 |

### 2028

| Term | From | To |
|------|------|----|
| Term 1 | 27 Jan 2028 | 31 Mar 2028 |
| Term 2 | 18 Apr 2028 | 30 Jun 2028 |
| Term 3 | 17 Jul 2028 | 22 Sep 2028 |
| Term 4 | 9 Oct 2028 | 21 Dec 2028 |

---

## Usage — Prompt Template

When passing this data to Claude for pricing logic, use the following format:

```
You are implementing a dynamic pricing strategy for an Airbnb in Victoria, Australia.
Use the following date classifications to determine the pricing tier for any given date:

- PUBLIC_HOLIDAY: [paste Section 1 dates]
- SCHOOL_HOLIDAY: [paste Section 2 date ranges]
- STANDARD: all other dates within school term periods

Priority rule: PUBLIC_HOLIDAY > SCHOOL_HOLIDAY > STANDARD.
Summer break (mid-Dec to late Jan) may be treated as SUMMER_PEAK within SCHOOL_HOLIDAY.

Given a check-in date of [DATE] and check-out date of [DATE], determine:
1. The pricing tier for each night
2. The recommended pricing multiplier to apply
3. Any special notes (e.g. AFL Grand Final weekend, Easter cluster)
```

---

*Calendar data sourced from Victoria State Government Education and Training, 2026–2028.*
