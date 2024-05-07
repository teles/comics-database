# YouTube/AirTable integration

## Introduction
This project aims to integrate YouTube with AirTable, allowing users to automatically sync YouTube video data to an AirTable database. This can be useful for managing and analyzing YouTube video metrics, such as views, likes, and comments.

## Installation
To use this integration, follow these steps:

1. Clone this repository to your local machine.
2. Install the required dependencies by running the following command:
    ```
    npm install
    ```
3. Set up your AirTable API credentials by creating a `.env` file in the root directory of the project. Add the following lines to the file:
    ```
    AIRTABLE_API_KEY=your_api_key
    AIRTABLE_BASE_ID=your_base_id
    ```
    Replace `your_api_key` with your AirTable API key and `your_base_id` with the ID of your AirTable base.
4. Run the integration script by executing the following command:
    ```
    npm run sync
    ```
    This will start syncing the YouTube video data to your AirTable database.

## Configuration
You can customize the integration by modifying the `config.js` file in the project's root directory. This file contains various settings, such as the YouTube channel ID to sync, the AirTable table name, and the fields to populate in the AirTable records.

## Usage
Once the integration is set up and running, it will automatically sync the YouTube video data to your AirTable database. You can view and analyze the data in AirTable, and use it for various purposes, such as generating reports or tracking video performance over time.

## Contributing
Contributions are welcome! If you have any ideas, suggestions, or bug reports, please open an issue or submit a pull request on GitHub.

## License
This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.