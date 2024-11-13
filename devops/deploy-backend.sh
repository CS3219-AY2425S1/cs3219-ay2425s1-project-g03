#!/bin/bash

# Configuration
AWS_REGION="ap-southeast-1"
ECS_CLUSTER="backend-cluster"
SERVICES=("question" "user" "match" "collaboration" "history")

# Validate the user input for desired number of tasks
if [[ "$1" != "0" && "$1" != "1" ]]; then
  echo "Error: The desired number of tasks must be either 0 or 1."
  echo "Usage: $0 <desired_tasks>"
  echo "Example: $0 1  # Scale each service to 1 task"
  echo "Example: $0 0  # Scale each service to 0 tasks"
  exit 1
fi

DESIRED_TASKS=$1  # Desired number of tasks (0 or 1)

# Function to update ECS service
update_service() {
  local service=$1

  echo "Updating ECS service for $service..."

  # Update ECS Service to trigger deployment with the desired number of tasks
  aws ecs update-service \
    --cluster "$ECS_CLUSTER" \
    --service "$service-service" \
    --desired-count "$DESIRED_TASKS" \
    --force-new-deployment \
    --region "$AWS_REGION" \
    --output text > /dev/null 2>&1

  if [[ $? -eq 0 ]]; then
    echo "Service $service updated successfully with desired task count: $DESIRED_TASKS"
  else
    echo "Error updating service $service"
    exit 1
  fi
}

# Main script execution
for service in "${SERVICES[@]}"; do
  update_service "$service"
done

echo "All services have been updated."
