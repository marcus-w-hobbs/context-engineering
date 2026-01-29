Execute the plan: $ARGUMENTS

If no argument provided, list available plans in `plans/` and ask which to execute.

## Work Workflow

1. **Load the plan**
   - Read `plans/$ARGUMENTS` (or selected plan)
   - Parse the implementation steps and files to modify
   - **Read the "Learnings Applied" section** - note gotchas to avoid
   - If learnings are referenced, read those solution files for full context

2. **Create tasks**
   - Break plan into atomic tasks
   - Include verification steps as tasks

3. **Execute sequentially**
   - Mark each task in_progress before starting
   - Make changes following project patterns
   - Mark task completed immediately after
   - Commit at logical checkpoints

4. **Quality checks**
   - Run linting
   - Run type checking
   - Run tests
   - Build to verify no errors

5. **Update plan file**
   - Mark completed items with `[x]` in the plan
   - Add any learnings or deviations noted

6. **Final summary**
   - List what was completed
   - List any remaining items
   - Suggest running `/compound-learnings` if a notable problem was solved
