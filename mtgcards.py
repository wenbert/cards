import sqlite3
import argparse
import urllib
import csv
import os

special_chars = '!@#$%^&*()+-={}|[]\;\':",./<>?'

def init(dbname):
    ''' Initialize SQLite database and tables '''
    try:
        db= sqlite3.connect(dbname)
    except IOError, e:
        print 'Cannot connect to database. ' + dbname
        return -1
    cursor = db.cursor()
    # Cards table
    cursor.execute(
        '''
        CREATE TABLE IF NOT EXISTS Cards
        (
        Name TEXT,
        [Set] TEXT,
        Slug TEXT,
        ImageFile TEXT,
        Color TEXT,
        Cost TEXT,
        ConvertedCost TEXT,
        Type TEXT,
        Power TEXT,
        Toughness TEXT,
        Rarity TEXT,
        RulesText TEXT
        )
        '''
    )
    # Card Images table
    cursor.execute(
        '''
        CREATE TABLE IF NOT EXISTS CardImages
        (
        [Set] TEXT,
        Slug TEXT,
        ImageFile TEXT,
        ImageURL TEXT
        )
        '''
    )
    cursor.execute(
        '''
        CREATE TABLE IF NOT EXISTS Logs
        (
        Date TEXT
        )
        '''
    )
    cursor.close()

def update(sourcefile, dbname):
    # Get the update list
    print 'Downloading update list from ' + sourcefile + '...'
    update_list_filename = sourcefile.split('/')[-1]
    urllib.urlretrieve(sourcefile, update_list_filename)
    update_list = open(update_list_filename)

    # Go through the update list, and get the list for sets and images
    print 'Reading update list ' + update_list_filename + '...'
    sets = []
    card_images = []
    update_list_reader = csv.reader(update_list, delimiter='\t')
    # TODO: check the date if it is new
    for row in update_list_reader:
        if len(row) > 0 and len(row[0].split('/')) > 2 and row[0].split('/')[2] == 'sets':
            if row[1].split('.')[-1] == 'txt':
                sets.append(row[1])
        if len(row) > 0 and len(row[0].split('/')) > 2 and 'CardImageURLs' in row[0].split('/')[2]:
            card_images.append(row[1])

    set_files = []
    for set_url in sets:
        print 'Downloading set data from ' + set_url + '...'
        set_filename = set_url.split('/')[-1]
        urllib.urlretrieve(set_url, set_filename)
        set_files.append(set_filename)

    card_image_files = []
    for card_image_url in card_images:
        print 'Downloading card image data from ' + card_image_url + '...'
        card_image_filename = card_image_url.split('/')[-1]
        urllib.urlretrieve(card_image_url, card_image_filename)
        card_image_files.append(card_image_filename)

    # insert into database
    try:
        db= sqlite3.connect(dbname)
        db.text_factory = str
    except IOError, e:
        print 'Cannot connect to database. ' + dbname
        return -1
    cursor = db.cursor()

    cursor.execute('DELETE FROM Cards')
    for set_filename in set_files:
        print 'Importing set data from ' + set_filename + '...'
        set_file = open(set_filename, 'r')
        reader = csv.reader(set_file, delimiter='\t')
        counter = 0
        total = 0
        for row in reader:
            if counter > 0:
                name = row[0]
                set = row[1]
                slug = sluggify(row[2])
                imgfile = row[2]
                color = row[3]
                cost = row[4]
                cmc = row[5]
                type = row[6]
                power = row[7]
                tough = row[8]
                rarity = row[9]
                try:
                    rulestext = row[10]
                except IndexError, e:
                    rulestext = ''
                try:
                    cursor.execute('''
                        INSERT INTO Cards
                        (Name, [Set], Slug, ImageFile, Color, Cost,
                         ConvertedCost, Type, Power, Toughness, Rarity,
                         RulesText)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                        ''',
                       (name, set, slug, imgfile, color, cost, cmc, type, power, tough, rarity, rulestext)
                    )
                    counter += 1
                except sqlite3.ProgrammingError, e:
                    print e
                    print set_filename, row[0], row[1]
                    print row
                    db.rollback()
                    return -1
            if counter == 0: counter += 1
            total += 1
        print 'Imported %d/%d cards from %s.' % (counter, total, set_filename)
        set_file.close()

    cursor.execute('DELETE FROM CardImages')
    for card_image_filename in card_image_files:
        print 'Importing card image data from ' + card_image_filename + '...'
        card_image_file = open(card_image_filename, 'r')
        reader = csv.reader(card_image_file, delimiter='\t')
        counter = 0
        total = 0
        for row in reader:
            if counter > 0:
                set = row[0].split('/')[0]
                slug = sluggify(row[0].split('/')[1].split('.')[0])
                imgfile = row[0].split('/')[1].split('.')[0]
                imgurl = row[1]
                try:
                    cursor.execute('''
                        INSERT INTO CardImages
                        ([Set], Slug, ImageFile, ImageURL)
                        VALUES (?, ?, ?, ?)
                        ''',
                       (set, slug, imgfile, imgurl)
                    )
                    counter += 1
                except sqlite3.ProgrammingError, e:
                    print e
                    print set_filename, row[0]
                    print row
                    db.rollback()
                    return -1
            if counter == 0: counter += 1
            total += 1
        print 'Imported %d/%d card images data from %s.' % (counter, total, card_image_filename)
        card_image_file.close()

    update_list.close()
    print 'Cleaning up...'
    #TODO: Uncomment these
    '''
    for f in set_files:
        os.remove(f)
    for f in card_image_files:
        os.remove(f)
    '''
    db.commit()
    cursor.close()

def sluggify(text):
    cleaned_text = text.translate(None, special_chars)
    cleaned_text = cleaned_text.replace(' ', '-').replace('_', '-').lower()
    return cleaned_text

def main():
    parser = argparse.ArgumentParser(description='Place M:tG card details into SQLite table. Uses AngelFire\'s data.')

    parser.add_argument('-s', '--sourcefile', default='http://www.angelfire.com/funky/magiclackey/medium/updatelist.txt', help='Updatelist text file to get Magic cards/sets info. ')
    parser.add_argument('-o', '--output', default='mtgcards.db', help='The name for the SQLite database. ')

    args = parser.parse_args()

    init(args.output)
    update(args.sourcefile, args.output)

if __name__ == '__main__':
    main()