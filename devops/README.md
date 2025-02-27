# Backend Deployment

This script allows you to set the desired number of tasks for each backend service.

## Prerequisites

Before using this script, ensure that you have the following:

1. **AWS CLI**: You must have the AWS CLI installed on your machine to interact with AWS services. You may install AWS CLI [here](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html).

2. **Access Keys**: You may obtain the AWS environment variables from the AWS Access Portal.

## Running the Script

1. Open a terminal and navigate to the `devops/` directory where the script is located.

2. Obtain your AWS Access Keys:
- Log in to the **AWS Access Console**.
- Click on **Access keys**.
- Copy the AWS environment variables into your terminal:

```bash
export AWS_ACCESS_KEY_ID=<AccessKeyId>
export AWS_SECRET_ACCESS_KEY=<SecretAccessKey>
export AWS_SESSION_TOKEN=<SessionToken>
```

3. To scale the services to **1 task** (i.e., start the services), run the following command:

```bash
./deploy-backend.sh 1
```

4. To scale the services to **0 tasks** (i.e., stop the services), run the following command:

```bash
./deploy-backend.sh 0
```

## Troubleshooting

**Q: Why doesn't the script work when I try to run it?**

**A:** Ensure you are using the correct IAM user with sufficient permissions to update ECS services.

---

**Q: The script won't run due to a permission error**

**A:** This could be due to the script not having the correct execution permissions. Run the following command to give the script execute permissions:

```bash
chmod +x deploy-backend.sh
```

---

**Q: The script worked before but doesn't work anymore**

**A:** This could be due to the environment variables expiring. Copy a new set of environment variables as shown above.
