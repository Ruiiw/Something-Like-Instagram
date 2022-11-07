from flask import Response, request
from flask_restful import Resource
import json
from models import db, Comment, Post
from views import can_view_post
import flask_jwt_extended

class CommentListEndpoint(Resource):

    def __init__(self, current_user):
        self.current_user = current_user
    
    @flask_jwt_extended.jwt_required()
    def post(self):
        # create a new "Comment" based on the data posted in the body 
        body = request.get_json()
        print(body)

        if not body.get('text'):
            return Response(json.dumps({"message": "'text' is required"}), mimetype="application/json", status=400)

        post_id = body.get('post_id')
        try: 
            post_id = int(post_id)
        except:
            return Response(json.dumps({"message": "invalid post id"}), mimetype="application/json", status=400)

        if can_view_post(post_id, self.current_user) == False:
            return Response(json.dumps({"message": "invalid post id"}), mimetype="application/json", status=404)

        new_comment = Comment(
            text=body.get('text'),
            post_id=body.get('post_id'),
            user_id=self.current_user.id # must be a valid user_id or will throw an error
        )
        db.session.add(new_comment)    # issues the insert statement
        db.session.commit()         # commits the change to the database 

        return Response(json.dumps(new_comment.to_dict()), mimetype="application/json", status=201)

    
        
class CommentDetailEndpoint(Resource):

    def __init__(self, current_user):
        self.current_user = current_user
  
    @flask_jwt_extended.jwt_required()
    def delete(self, id):
        # delete "Comment" record where "id"=id
        comment = Comment.query.get(id)
        if not comment:
            return Response(json.dumps({"message": "Invalid comment"}), mimetype="application/json", status=404)
        if self.current_user.id == comment.user_id:
            Comment.query.filter_by(id=id).delete()
            db.session.commit()
            return Response(json.dumps({"message": "Comment={0} was successfully deleted".format(id)}), mimetype="application/json", status=200)
        else: 
            return Response(json.dumps({"message": "Invalid delete"}), mimetype="application/json", status=404)


def initialize_routes(api):
    api.add_resource(
        CommentListEndpoint, 
        '/api/comments', 
        '/api/comments/',
        resource_class_kwargs={'current_user': flask_jwt_extended.current_user}

    )
    api.add_resource(
        CommentDetailEndpoint, 
        '/api/comments/<int:id>', 
        '/api/comments/<int:id>/',
        resource_class_kwargs={'current_user': flask_jwt_extended.current_user}
    )
