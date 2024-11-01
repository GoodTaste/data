## Good Taste Open Data

An open dataset to add transparency to the food system from the food brands, farms, and ranches from [goodtaste.co](https://goodtaste.co).

## Automated Data Updates

We have implemented an automated system to keep our public data snapshot up-to-date:
- Changes in our Supabase database trigger a webhook to our GitHub repository.
- Once a day, a GitHub Action then fetches the latest data and updates the files in the [/public-data](/public-data/) directory.
- This ensures that the data in this repository is always current and reflects the latest information in our database.

## Licensing
The dataset is licensed under the [Creative Commons Attribution 4.0 International License](LICENSE-DATA).