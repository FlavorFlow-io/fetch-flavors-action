<p align="center">
  <img src="./flavorflow_logo.png" alt="FlavorFlow Logo" width="180" />
  <h1 align="center">FlavorFlow</h1>
</p>

# Fetch Clients GitHub Action

[![Latest Release](https://img.shields.io/github/v/release/FlavorFlow-io/fetch-flavors-action?label=latest%20version)](https://github.com/FlavorFlow-io/fetch-flavors-action/releases)

This action fetches and outputs the available Clients for your project. It is useful for workflows that need to dynamically retrieve and use flavor information (e.g., for building, testing, or deploying different variants).

**About the SaaS:**

[flavorflow.io](https://flavorflow.io) is a portal to manage white-label app clients. It helps you organize, configure, and maintain multiple branded versions of your application, streamlining the process of delivering customized apps to different customers.

## Inputs

### `project-api-key`

**Required** The project API key used to fetch Clients from the API.

## Outputs

### `flavors`

A JSON object string wrapping the list of clients: `{ "flavors": [ ... ] }`. Each entry is a client object (`id`, `name`, `app_name`, `package_name`, `logo_url`, `theme`, `variables`). The wrapper shape is designed to be dropped straight into a matrix `include`.

## Example usage

**Note:** Replace `v1` with the latest version shown in the badge above, or use a specific version tag for better reproducibility.

```yaml
# Access the output in a subsequent step:
steps:
  - id: fetch-flavors
    uses: FlavorFlow-io/fetch-flavors-action@v1
    with:
      project-api-key: ${{ secrets.PROJECT_API_KEY }}
  - name: Print flavors
    run: echo "Flavors: ${{ steps.fetch-flavors.outputs.flavors }}"
```

## Matrix build example

You can use the output to create a dynamic matrix build in your workflow:

```yaml
jobs:
  fetch-flavors:
    runs-on: ubuntu-latest
    outputs:
      flavors: ${{ steps.fetch-flavors.outputs.flavors }}
    steps:
      - id: fetch-flavors
        uses: FlavorFlow-io/fetch-flavors-action@v1
        with:
          project-api-key: ${{ secrets.PROJECT_API_KEY }}

  build:
    needs: fetch-flavors
    runs-on: ubuntu-latest
    strategy:
      matrix:
        include: ${{ fromJson(needs.fetch-flavors.outputs.flavors).flavors }}
    steps:
      - name: Build for flavor
        run: |
          echo "Building for flavor: ${{ matrix.name }}"
          # add your build steps here
```