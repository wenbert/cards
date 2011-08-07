'''sqlitetoredis.py'''
import sqlite3
from sys import argv
import os
import redis


def init(db_path):
    '''Init the SQLite db'''
    try:
        db = sqlite3.connect(db_path)
        db.text_factory = lambda x: unicode(x, "utf-8", "ignore")
    except IOerror, e:
        print 'Cannot connect to database.';
        return -1
        
    cursor = db.cursor()
    
    try:
        cursor.execute('''
            SELECT 
            c.Name,
            c.`Set`,
            c.Slug,
            c.ImageFile,
            c.Color,
            c.Cost,
            c.ConvertedCost,
            c.Type,
            c.Power,
            c.Toughness,
            c.Rarity,
            c.RulesText,
            i.ImageURL 
            FROM Cards c JOIN CardImages i ON i.Slug=c.Slug
            '''
        )
    except sqlite3.ProgrammingError, e:
        print e
        print set_filename, row[0], row[1]
        print row
        db.rollback()
        return -1
        
    cards = cursor.fetchall()
    
    r = redis.Redis(host='localhost', port=6379, db=0)
    
    for card in cards:
        #cid = r.incr('cid')
        r.hset(("cards:%s" % card[2]), 'name',card[0])
        r.hset(("cards:%s" % card[2]), 'set',card[1])
        r.hset(("cards:%s" % card[2]), 'slug',card[2])
        r.hset(("cards:%s" % card[2]), 'rulestext',card[11])
        r.hset(("cards:%s" % card[2]), 'color',card[4])
        r.hset(("cards:%s" % card[2]), 'cost',card[5])
        r.hset(("cards:%s" % card[2]), 'convertedcost',card[6])
        r.hset(("cards:%s" % card[2]), 'type',card[7])
        r.hset(("cards:%s" % card[2]), 'power',card[8])
        r.hset(("cards:%s" % card[2]), 'toughness',card[9])
        r.hset(("cards:%s" % card[2]), 'rarity',card[10])
        r.hset(("cards:%s" % card[2]), 'imagefile',card[3])
        r.hset(("cards:%s" % card[2]), 'imageurl',card[12])
        
        print u""+card[2]+" [success]"
    cursor.close()
    
def main():
    script, db_path = argv
    init(db_path)
        
if __name__ == '__main__':
    main()