<p align="center">
  <img src="./prisme_logo.png" alt="Prisme Logo" width="180" />
</p>

# Fetch Flavors GitHub Action

[![Latest Release](https://img.shields.io/github/v/release/lucianosantosdev/prisme-fetch-flavors-action?label=latest%20version)](https://github.com/lucianosantosdev/prisme-fetch-flavors-action/releases)

This action fetches and outputs the available flavors for your project. It is useful for workflows that need to dynamically retrieve and use flavor information (e.g., for building, testing, or deploying different variants).

**About the SaaS:**

[prisme.lucianosantos.dev](https://prisme.lucianosantos.dev) is a portal to manage white-label app clients. It helps you organize, configure, and maintain multiple branded versions of your application, streamlining the process of delivering customized apps to different customers.

## Inputs

### `project-api-key`

**Required** The project API key used to fetch flavors from the API.

## Outputs

### `flavors`

The list of available flavors as a JSON array string.


## Example usage

**Note:** Replace `v1` with the latest version shown in the badge above, or use a specific version tag for better reproducibility.

```yaml
# Access the output flavors in a subsequent step:
steps:
  - id: fetch-flavors
    uses: lucianosantosdev/prisme-fetch-flavors-action@v1
    with:
      project-api-key: ${{ secrets.PROJECT_API_KEY }}
  - name: Print flavors
    run: echo "Flavors: ${{ steps.fetch-flavors.outputs.flavors }}"
```

## Matrix build example

You can use the output flavors to create a dynamic matrix build in your workflow:

```yaml
jobs:
  fetch-flavors:
    runs-on: ubuntu-latest
    outputs:
      flavors: ${{ steps.fetch-flavors.outputs.flavors }}
    steps:
      - id: fetch-flavors
        uses: lucianosantosdev/prisme-fetch-flavors-action@v1
        with:
          project-api-key: ${{ secrets.PROJECT_API_KEY }}

  build:
    needs: fetch-flavors
    runs-on: ubuntu-latest
    strategy:
      matrix:
        flavor: ${{ fromJson(needs.fetch-flavors.outputs.flavors) }}
    steps:
      - name: Build for flavor
        run: |
          echo "Building for flavor: ${{ matrix.flavor }}"
          # add your build steps here
```