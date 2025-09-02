<p align="center">
  <img src="./flavorflow_logo.png" alt="FlavorFlow Logo" width="180" />
</p>

# Fetch Clients GitHub Action

[![Latest Release](https://img.shields.io/github/v/release/lucianosantosdev/prisme-fetch-clients-action?label=latest%20version)](https://github.com/lucianosantosdev/prisme-fetch-clients-action/releases)

This action fetches and outputs the available Clients for your project. It is useful for workflows that need to dynamically retrieve and use flavor information (e.g., for building, testing, or deploying different variants).

**About the SaaS:**

[flavorflow.io](https://flavorflow.io) is a portal to manage white-label app clients. It helps you organize, configure, and maintain multiple branded versions of your application, streamlining the process of delivering customized apps to different customers.

## Inputs

### `project-api-key`

**Required** The project API key used to fetch Clients from the API.

## Outputs

### `Clients`

The list of available Clients as a JSON array string.


## Example usage

**Note:** Replace `v1` with the latest version shown in the badge above, or use a specific version tag for better reproducibility.

```yaml
# Access the output Clients in a subsequent step:
steps:
  - id: fetch-clients
  uses: lucianosantosdev/flavorflow-fetch-clients-action@v1
    with:
      project-api-key: ${{ secrets.PROJECT_API_KEY }}
  - name: Print Clients
    run: echo "Clients: ${{ steps.fetch-clients.outputs.Clients }}"
```

## Matrix build example

You can use the output Clients to create a dynamic matrix build in your workflow:

```yaml
jobs:
  fetch-clients:
    runs-on: ubuntu-latest
    outputs:
      Clients: ${{ steps.fetch-clients.outputs.Clients }}
    steps:
      - id: fetch-clients
  uses: lucianosantosdev/flavorflow-fetch-clients-action@v1
        with:
          project-api-key: ${{ secrets.PROJECT_API_KEY }}

  build:
    needs: fetch-clients
    runs-on: ubuntu-latest
    strategy:
      matrix:
        flavor: ${{ fromJson(needs.fetch-clients.outputs.Clients) }}
    steps:
      - name: Build for flavor
        run: |
          echo "Building for flavor: ${{ matrix.flavor }}"
          # add your build steps here
```