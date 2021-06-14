#!/usr/bin/env python
# coding: utf-8

# This program runs from the csv file museum.csv containing information about museums in the U.S.
# It generates a javascript file that can be run in Studio3T to add documents
# For this instance, the structure is as follows:
# Database called Assignment (use Assignment)
# Collection called museum_embed (db.museum_embed.insert)
# Every museum_embed insert contains the following information:
# A single Museum ID, Museum name, Museum type, Street address, City, State, Zip code, Latitude, Longitude, Phone Number
# All inserted in the order listed above
# For this case, Museum ID is unique, given that we've dropped duplicates

import pandas as pd
import json

# Read the csv into df
df = pd.read_csv('data/museums.csv', sep=',', delimiter=None, encoding='latin-1', low_memory=False)

# Rename columns to remove whitespace
df_rename = df.rename(columns={'Museum ID': 'museumID',
                               'Museum Name': 'museumName',
                               'Museum Type': 'museumType',
                               'Street Address (Physical Location)': 'streetAddress',
                               'City (Physical Location)': 'city',
                               'State (Physical Location)': 'state',
                               'Zip Code (Physical Location)': 'zipCode',
                               'Phone Number': 'phoneNumber',
                               'Latitude': 'latitude',
                               'Longitude': 'longitude'})

# Select only columns that are wanted
df = df_rename[['museumID', 'museumName', 'museumType', 'streetAddress', 'city', 'state', 'zipCode', 'phoneNumber',
                'latitude', 'longitude']]

# Drop rows will null/nan values
df = df.dropna()
# Reset index so row numbers are accurate
df = df.reset_index(drop=True)

# In order to reduce dataset size down to manageable size (~1300-1400 rows)
# Select museums from only four states - Alabama, California, New York & Washington
states = ['AL', 'CA', 'NY', 'WA']

# Select rows from dataframe whose column value of 'state' is in the list of states
df = df[df.state.isin(states)]

# Print df to check
print(df)

# Extract museum id to identify each document, drop duplicates to make unique
museum_embed = df[['museumID']].drop_duplicates()

def writemuseumfile(file):
    # Write document inserts to the specified file
    file = open(file, 'w')

    # Choose Assignment database
    rec = 'use Assignment\n'
    file.write(rec)

    # For each unique museum id
    for r in thisfile[['museumID']].itertuples(index=False):
        theserows = (df[(df['museumID'] == r)])

        # Retrieve the info that will be in the main part of the document
        info = theserows[['museumName', 'museumType', 'streetAddress', 'city', 'state', 'zipCode', 'latitude',
                          'longitude', 'phoneNumber']].drop_duplicates()

        # Make up the document
        entries = json.dumps({"museumID": r,
                              "museumName": info['museumName'].values[0],
                              "museumType": info['museumType'].values[0],
                              "streetAddress": info['streetAddress'].values[0],
                              "city": info['city'].values[0],
                              "state": info['state'].values[0],
                              "zipCode": info['zipCode'].values[0],
                              "phoneNumber": info['phoneNumber'].values[0]})

        # Create the document insert
        rec = 'db.museum_flat.insert(' + entries + ')\n'
        # Write insert statement to the .js file
        file.write(rec)
    file.close()
    return ()


# Define .js file to be used/created
filename = 'data/museum_flat.js'
thisfile = museum_embed
# Call function to write the inserts to the file
b = writemuseumfile(filename)
