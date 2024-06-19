**[CodeScan Cloud][sc]** enables your development team to deliver Clean Code consistently and efficiently by seamlessly integrating into your cloud DevOps platforms and extending your CI/CD workflow. This SaaS tool catches Security Vulnerabilities, Bugs, and Code Smells in your pull requests, branches, and throughout your repository, with more than 2 billion lines of code and 120,000+ active projects analyzed every week.

You can start a no-commitment, 14-day trial of CodescanCloud for your private repositories completely free. No need to speak with a sales rep or request a license key - get automatic code analysis results on your private projects in minutes! CodescanCloud analysis is always free for open-source projects. You can create your free CodescanCloud account [here][signup].

This Azure DevOps extension provides build tasks that you can add in your build definition. You'll benefit from automated detection of bugs and vulnerabilities across all branches and Pull Requests. CodescanCloud explains all coding issues in details, giving you chance to fix your code before even merging and deploying, all the while learning best practices along the way. At project level, you'll also get a dedicated widget that tracks the overall health of your application.


## About the CodescanCloud Azure DevOps Marketplace Extension

This extension provides the following features:

- A dedicated **CodescanCloud EndPoint** to set the user token and validate the connection.
- Three build tasks (along with build templates) to get your projects analyzed easily:
  - **Prepare Analysis Configuration** task, to configure all the required settings before executing the build. This task is mandatory. In case of .NET solutions or Java projects, this tasks helps to integrate seamlessly with MSBuild, Maven and Gradle tasks.
  - **Run Code Analysis** task, to actually execute the analysis of the source code. Not required for Maven or Gradle projects.
  - **Publish Quality Gate Result** task, to display the quality gate status in the build summary. This task is optional, as it can increase the overall build time.
- Analysis of the branches and the **pull requests** of your projects
- A **widget** to monitor the quality gate for your projects on your favorite dashboard
- A **deployment gate (in preview)** allowing you to control your deployment process by checking the status of the Quality Gate of the last build related to the release pipeline executed.

Note that the above features are **available for all Git repository providers in Azure DevOps**: Azure Repos Git, Bitbucket Cloud or GitHub.

## Highlighted Features

### Seamless Integration with .Net solutions

The analysis of C# and VB. Net solution is really straightforward since it only requires adding the two **Prepare Analysis Configuration** and **Run Code Analysis** tasks to your build definition.

### Easy setup for Maven and Gradle projects

If you're doing Java, analyzing your source code is also very easy. It only requires adding the **Prepare Analysis Configuration** task, and check the **Run CodescanCloud Analysis** option in the "Code Analysis" panel of the Maven or Gradle task.

### Branch and Pull Request analysis

Whatever type of source repository you are analysing, when a build is run on a branch of your project, the extension automatically configures the analysis to be pushed to the relevant project branch on CodescanCloud:

![Branches](img/branches.png)

If you configure your build definition as a build validation for pull requests of that project (this can be done on "Branch policies"), CodescanCloud will also analyze the code changes and decorate the pull request with comments and overall status so that you can merge with confidence:

![PR-Decoration](img/pull-request-decoration.png)

**Important note**: to activate pull request decoration, you must specify a user token in the "General Settings > Pull Requests" administration page of your project in CodescanCloud.

### Quality Gate Status

#### In a dashboard widget

You can monitor the quality gate status of your projects in your favorite dashboard:

![Quality Gate Widget](img/widget.png)

#### In Release Pipelines (Preview)

You can check the quality gate status of a build as a pre-deployment gate in release pipelines.

#### In the build summary

The **Publish Quality Gate Result** task waits for the analysis report to be consumed by CodescanCloud in order to flag the build job with the Quality Gate status. The Quality Gate is a major, out-of-the-box feature of CodescanCloud. It provides the ability to know at each analysis whether an application passes or fails the release criteria. In other words it tells you at every analysis whether an application is ready for production "quality-wise".

Example of a passing Quality Gate:

![Passed Quality Gate](img/sq-analysis-report-passed.png)

Example of a failing Quality Gate:

![Failed Quality Gate](img/sq-analysis-report-failed.png)

[sc]: <https://app.codescan.io>
[getstarted]: <http://www.code-scan.com/cloud/install-configure-scanner-tfs-ts>