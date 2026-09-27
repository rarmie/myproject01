# Extraction eval fixtures

Real job postings saved as plain text, one per file (`01.txt`, `02.txt`, ...).

These are **data, not scratch work** — they are tracked deliberately because the
extraction eval set is built from them, and that happens weeks after they are
collected. Do not delete or rewrite an existing file: an eval baseline recorded
against `03.txt` is meaningless if `03.txt` later holds a different posting. Add
new postings under new numbers instead.

Aim for spread rather than volume. A set where every posting is clean and
complete will score 100% forever and cannot detect a prompt regression. Useful
variation:

- a clear salary range, and one with no salary stated at all
- a vague or inflated job title, and one plainly titled
- one very long posting (exercises truncation)
- one where the company name is hard to find, or absent

A posting with no discoverable company is expected to *fail* validation, since
`ExtractResponse.company` is a required `str`. That is a signal about the schema,
not a broken fixture.
