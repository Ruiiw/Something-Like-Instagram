from flask import Response, request
from flask_restful import Resource
from models import Bookmark, db
import json
from views import can_view_post
import flask_jwt_extended

class BookmarksListEndpoint(Resource):

    def __init__(self, current_user):
        self.current_user = current_user
    
    @flask_jwt_extended.jwt_required()
    def get(self):
        # get all bookmarks owned by the current user
        bookmarks = Bookmark.query.filter_by(user_id = self.current_user.id)
        bookmarks_json = [bookmark.to_dict() for bookmark in bookmarks]
        return Response(json.dumps(bookmarks_json), mimetype="application/json", status=200)

    @flask_jwt_extended.jwt_required()
    def post(self):
        # create a new "bookmark" based on the data posted in the body 
        body = request.get_json()
        print(body)
        post_id = body.get('post_id')
        try: 
            post_id = int(post_id)
        except:
            return Response(json.dumps({"message": "invalid post id"}), mimetype="application/json", status=400)

        if can_view_post(post_id, self.current_user) == False:
            return Response(json.dumps({"message": "invalid post id"}), mimetype="application/json", status=404)

        try: 
            new_bookmark = Bookmark(
                post_id=post_id,
                user_id=self.current_user.id,
            )
            db.session.add(new_bookmark)    # issues the insert statement
            db.session.commit()         # commits the change to the database 
            return Response(json.dumps(new_bookmark.to_dict()), mimetype="application/json", status=201)

        except Exception:
            return Response(json.dumps({"message": "invalid post id"}), mimetype="application/json", status=400)

class BookmarkDetailEndpoint(Resource):

    def __init__(self, current_user):
        self.current_user = current_user
    
    @flask_jwt_extended.jwt_required()
    def delete(self, id):
        # delete "bookmark" record where "id"=id
        bookmark = Bookmark.query.get(id)
        if not bookmark:
            return Response(json.dumps({"message": "Invalid bookmark"}), mimetype="application/json", status=404)
        if self.current_user.id == bookmark.user_id:
            Bookmark.query.filter_by(id=id).delete()
            db.session.commit()
            return Response(json.dumps({"message": "Bookmark={0} was successfully deleted".format(id)}), mimetype="application/json", status=200)
        else: 
            return Response(json.dumps({"message": "Invalid delete"}), mimetype="application/json", status=404)


def initialize_routes(api):
    api.add_resource(
        BookmarksListEndpoint, 
        '/api/bookmarks', 
        '/api/bookmarks/', 
        resource_class_kwargs={'current_user': flask_jwt_extended.current_user}
    )

    api.add_resource(
        BookmarkDetailEndpoint, 
        '/api/bookmarks/<int:id>', 
        '/api/bookmarks/<int:id>',
        resource_class_kwargs={'current_user': flask_jwt_extended.current_user}
    )
